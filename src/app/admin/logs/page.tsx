
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { db, initAdmin } from "@/lib/firebase-admin";
import type { AttendanceLog, Worker } from "@/lib/types";
import { format } from "date-fns";
import { LogsFilterControls } from "./logs-filter-controls";
import { Timestamp } from "firebase-admin/firestore";

initAdmin();

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'Present': return 'default';
    case 'Late': return 'destructive';
    default: return 'secondary';
  }
};

type MappedLog = {
    id: string;
    workerName: string;
    workerRole: string;
    date: string;
    checkIn: string;
    checkOut: string;
    hours: string;
    status: 'Present' | 'Late' | 'Absent';
}

type AdminLogsPageProps = {
  searchParams: {
    name?: string;
    role?: string;
    from?: string;
    to?: string;
  }
}

async function getFilteredLogs(filters: AdminLogsPageProps['searchParams']): Promise<MappedLog[]> {
    let logsQuery: admin.firestore.Query<admin.firestore.DocumentData> = db.collection('attendance-logs');

    if (filters.from) {
      const fromDate = new Date(filters.from);
      fromDate.setHours(0, 0, 0, 0);
      logsQuery = logsQuery.where('checkIn', '>=', Timestamp.fromDate(fromDate));
    }

    if (filters.to) {
        const toDate = new Date(filters.to);
        toDate.setHours(23, 59, 59, 999);
        logsQuery = logsQuery.where('checkIn', '<=', Timestamp.fromDate(toDate));
    }
    
    logsQuery = logsQuery.orderBy('checkIn', 'desc');

    const logsSnapshot = await logsQuery.get();

    const workersSnapshot = await db.collection('workers').get();
    const workers = workersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Worker));
    const workersMap = new Map(workers.map(w => [w.id, w]));

    let logs = logsSnapshot.docs.map(doc => {
      const data = doc.data();
      const checkIn = (data.checkIn as Timestamp).toDate();
      const checkOut = data.checkOut ? (data.checkOut as Timestamp).toDate() : null;
      const worker = workersMap.get(data.workerId);

      return {
          id: doc.id,
          workerName: data.workerName,
          workerRole: worker?.role || 'Unknown',
          date: format(checkIn, 'yyyy-MM-dd'),
          checkIn: format(checkIn, 'p'),
          checkOut: checkOut ? format(checkOut, 'p') : '-',
          hours: data.hours.toFixed(2),
          status: data.status,
      } as MappedLog;
    });

    // Client-side filtering for name and role after initial data fetch
    if (filters.name) {
      logs = logs.filter(log => log.workerName.toLowerCase().includes(filters.name!.toLowerCase()));
    }
    if (filters.role) {
      logs = logs.filter(log => log.workerRole === filters.role);
    }
    
    return logs;
}


export default async function AdminLogsPage({ searchParams }: AdminLogsPageProps) {
  
  const logs = await getFilteredLogs(searchParams);

  const workersSnapshot = await db.collection('workers').get();
  const uniqueRoles = Array.from(new Set(workersSnapshot.docs.map(doc => doc.data().role as string)));

  return (
    <div className="p-4 md:p-8">
      <PageHeader
        title="Attendance Logs"
        description="A comprehensive record of all worker attendance."
      />

      <LogsFilterControls uniqueRoles={uniqueRoles} />
      
      <Card className="bg-card/80">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Worker</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Check-In</TableHead>
                <TableHead>Check-Out</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.workerName}</TableCell>
                  <TableCell>{log.workerRole}</TableCell>
                  <TableCell>{format(new Date(log.date), "LLL dd, y")}</TableCell>
                  <TableCell>{log.checkIn}</TableCell>
                  <TableCell>{log.checkOut}</TableCell>
                  <TableCell>{log.hours}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(log.status)}>{log.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
