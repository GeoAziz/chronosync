
'use client';
import { useState, useEffect, useMemo } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Filter, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, Timestamp } from "firebase/firestore";
import type { AttendanceLog, Worker } from "@/lib/types";

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

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<MappedLog[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [filters, setFilters] = useState<{name: string, role: string, dateRange: DateRange | undefined}>({
    name: '',
    role: '',
    dateRange: undefined
  });

  useEffect(() => {
    const unsubLogs = onSnapshot(collection(db, 'attendance-logs'), (snapshot) => {
      const logsData = snapshot.docs.map(doc => {
        const data = doc.data() as AttendanceLog;
        const checkIn = (data.checkIn as unknown as Timestamp).toDate();
        const checkOut = data.checkOut ? (data.checkOut as unknown as Timestamp).toDate() : null;
        let hours = 0;
        if (checkOut) {
            hours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
        }
        
        return {
            id: doc.id,
            workerName: data.workerName,
            workerRole: '', // We'll populate this later
            date: format(checkIn, 'yyyy-MM-dd'),
            checkIn: format(checkIn, 'p'),
            checkOut: checkOut ? format(checkOut, 'p') : '-',
            hours: hours.toFixed(2),
            status: data.status,
        } as MappedLog
      });
      setLogs(logsData);
    });

    const unsubWorkers = onSnapshot(collection(db, 'workers'), (snapshot) => {
        const workersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Worker));
        setWorkers(workersData);
    });

    return () => {
      unsubLogs();
      unsubWorkers();
    };
  }, []);

  const uniqueRoles = useMemo(() => {
    const roles = new Set(workers.map(w => w.role));
    return Array.from(roles);
  }, [workers]);

  const filteredLogs = useMemo(() => {
    let logsWithRoles = logs.map(log => {
        const worker = workers.find(w => w.name === log.workerName);
        return {...log, workerRole: worker?.role || 'Unknown'};
    });
    
    return logsWithRoles.filter(log => {
      const nameMatch = log.workerName.toLowerCase().includes(filters.name.toLowerCase());
      const roleMatch = filters.role ? log.workerRole === filters.role : true;
      let dateMatch = true;
      if(filters.dateRange?.from) {
        const logDate = new Date(log.date);
        if (filters.dateRange.to) {
            dateMatch = logDate >= filters.dateRange.from && logDate <= filters.dateRange.to;
        } else {
            dateMatch = format(logDate, 'yyyy-MM-dd') === format(filters.dateRange.from, 'yyyy-MM-dd');
        }
      }
      return nameMatch && roleMatch && dateMatch;
    });
  }, [logs, workers, filters]);

  const handleFilterChange = (key: 'name' | 'role', value: string) => {
      if (key === 'role' && value === 'all') {
          value = '';
      }
      setFilters(prev => ({...prev, [key]: value}));
  }

  const handleDateChange = (range: DateRange | undefined) => {
    setFilters(prev => ({...prev, dateRange: range}));
  }

  const clearFilters = () => {
    setFilters({ name: '', role: '', dateRange: undefined });
  }

  return (
    <div className="p-4 md:p-8">
      <PageHeader
        title="Attendance Logs"
        description="A comprehensive record of all worker attendance."
      />

      <Card className="bg-card/80 mb-8">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
                <label className="text-sm font-medium">Worker Name</label>
                <Input placeholder="Filter by name..." value={filters.name} onChange={(e) => handleFilterChange('name', e.target.value)} />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">Department</label>
                <Select value={filters.role} onValueChange={(value) => handleFilterChange('role', value)}>
                    <SelectTrigger>
                        <SelectValue placeholder="All Departments" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        {uniqueRoles.map(role => (
                            <SelectItem key={role} value={role}>{role}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal text-muted-foreground">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {filters.dateRange?.from ? (
                                filters.dateRange.to ? (
                                    `${format(filters.dateRange.from, "LLL dd, y")} - ${format(filters.dateRange.to, "LLL dd, y")}`
                                ) : (
                                    format(filters.dateRange.from, "LLL dd, y")
                                )
                            ) : (
                                <span>Pick a date range</span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="range"
                            selected={filters.dateRange}
                            onSelect={handleDateChange}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>
            <div className="flex gap-2">
                <Button onClick={clearFilters} variant="ghost" className="w-full">
                    <X className="mr-2 h-4 w-4" />
                    Clear
                </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-card/80">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Worker</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Check-In</TableHead>
                <TableHead>Check-Out</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.workerName}</TableCell>
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
