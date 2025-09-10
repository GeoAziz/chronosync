
'use client'
import { PageHeader } from "@/components/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { auth, db } from "@/lib/firebase";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";
import type { AttendanceLog } from "@/lib/types";
import { onAuthStateChanged } from "firebase/auth";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths } from "date-fns";

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'Present': return 'default';
    case 'Late': return 'destructive';
    default: return 'secondary';
  }
};

type MappedLog = Omit<AttendanceLog, 'checkIn' | 'checkOut'> & {
    date: string;
    checkIn: string;
    checkOut: string;
    present: boolean;
    absent: boolean;
    originalDate: Date;
}

export default function WorkerAttendancePage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [logs, setLogs] = useState<MappedLog[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [filter, setFilter] = useState('this-month');

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
        if(user) {
            setUserId(user.uid);
        } else {
            setUserId(null);
        }
    });
    return () => unsubscribeAuth();
  }, [])
  
  useEffect(() => {
    if (!userId) return;

    const q = query(
        collection(db, "attendance-logs"), 
        where("workerId", "==", userId),
        orderBy("checkIn", "desc")
    );

    const unsubscribeLogs = onSnapshot(q, (snapshot) => {
        const logsData = snapshot.docs.map(doc => {
            const data = doc.data() as AttendanceLog;
            const checkInDate = (data.checkIn as any).toDate();
            const checkOutDate = data.checkOut ? (data.checkOut as any).toDate() : null;

            return {
                ...data,
                id: doc.id,
                date: format(checkInDate, 'PPP'),
                checkIn: format(checkInDate, 'p'),
                checkOut: checkOutDate ? format(checkOutDate, 'p') : '-',
                present: data.status === 'Present' || data.status === 'Late',
                absent: data.status === 'Absent',
                originalDate: checkInDate
            }
        });
        setLogs(logsData);
    });

    return () => unsubscribeLogs();

  }, [userId])

  const filteredLogs = useMemo(() => {
    const now = new Date();
    return logs.filter(log => {
      const logDate = log.originalDate;
      switch (filter) {
        case 'this-week':
          return logDate >= startOfWeek(now) && logDate <= endOfWeek(now);
        case 'this-month':
          return logDate >= startOfMonth(now) && logDate <= endOfMonth(now);
        case 'last-3-months':
          return logDate >= subMonths(now, 3);
        default:
          return true;
      }
    });
  }, [logs, filter]);

  return (
    <div className="p-4 md:p-8">
      <PageHeader
        title="My Attendance"
        description="Review your sign-in and sign-out history."
      >
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="this-week">This Week</SelectItem>
            <SelectItem value="this-month">This Month</SelectItem>
            <SelectItem value="last-3-months">Last 3 Months</SelectItem>
          </SelectContent>
        </Select>
      </PageHeader>
      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>
        <TabsContent value="list">
          <Card className="bg-card/80">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Check-In</TableHead>
                    <TableHead>Check-Out</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((entry) => (
                    <TableRow key={entry.id} className={format(entry.originalDate, 'PPP') === format(new Date(), 'PPP') ? 'bg-primary/10' : ''}>
                      <TableCell className="font-medium">{entry.date}</TableCell>
                      <TableCell>{entry.checkIn}</TableCell>
                      <TableCell>{entry.checkOut}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(entry.status)}>{entry.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="calendar">
          <Card className="bg-card/80 flex justify-center p-4">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md"
              modifiers={{
                present: filteredLogs.filter(d => d.present).map(d => d.originalDate),
                absent: filteredLogs.filter(d => d.absent).map(d => d.originalDate),
              }}
              modifiersStyles={{
                present: {
                  color: 'hsl(var(--primary-foreground))',
                  backgroundColor: 'hsl(var(--primary))'
                },
                absent: {
                  color: 'hsl(var(--muted-foreground))',
                  backgroundColor: 'hsl(var(--muted))'
                }
              }}
            />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
