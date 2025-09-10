
'use client'
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Download, Calendar as CalendarIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig
} from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, LineChart, Line, BarChart, Bar } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, Timestamp } from 'firebase/firestore';
import type { AttendanceLog, Worker } from '@/lib/types';
import { DateRange } from "react-day-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, subDays, eachDayOfInterval, startOfDay } from "date-fns";

const chartConfig: ChartConfig = {
  attendance: { label: "Attendance %", color: "hsl(var(--chart-1))" },
  late: { label: "Late Arrivals", color: "hsl(var(--chart-4))" },
  hours: { label: "Total Hours", color: "hsl(var(--chart-2))" },
};

export default function AdminReportsPage() {
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [department, setDepartment] = useState('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({ from: subDays(new Date(), 29), to: new Date() });

  useEffect(() => {
    const unsubLogs = onSnapshot(collection(db, 'attendance-logs'), (snapshot) => {
      const logsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          checkIn: (data.checkIn as Timestamp).toDate(),
          checkOut: data.checkOut ? (data.checkOut as Timestamp).toDate() : null,
        } as AttendanceLog;
      });
      setLogs(logsData);
    });

    const unsubWorkers = onSnapshot(collection(db, 'workers'), (snapshot) => {
      setWorkers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Worker)));
    });

    return () => {
      unsubLogs();
      unsubWorkers();
    };
  }, []);

  const uniqueRoles = useMemo(() => Array.from(new Set(workers.map(w => w.role))), [workers]);
  
  const workersInDept = useMemo(() => {
    if (department === 'all') return workers;
    return workers.filter(w => w.role === department);
  }, [workers, department]);

  const filteredLogs = useMemo(() => {
    const workerIdsInDept = workersInDept.map(w => w.id);

    return logs.filter(log => {
      const isCorrectDept = workerIdsInDept.includes(log.workerId);
      let isWithinRange = true;
      if (dateRange?.from) {
        const checkInDate = startOfDay(log.checkIn);
        const fromDate = startOfDay(dateRange.from);
        if (dateRange.to) {
          const toDate = startOfDay(dateRange.to);
          isWithinRange = checkInDate >= fromDate && checkInDate <= toDate;
        } else {
          isWithinRange = checkInDate.getTime() === fromDate.getTime();
        }
      }
      return isCorrectDept && isWithinRange;
    });
  }, [logs, workersInDept, dateRange]);
  
  const attendanceTrends = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return [];
    
    const intervalDays = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });
    const totalWorkersInDept = workersInDept.length;

    if (totalWorkersInDept === 0) return [];

    return intervalDays.map(day => {
      const dayString = format(day, 'MMM dd');
      const logsForDay = filteredLogs.filter(log => format(log.checkIn, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'));
      const presentCount = new Set(logsForDay.map(l => l.workerId)).size;
      const attendance = totalWorkersInDept > 0 ? (presentCount / totalWorkersInDept) * 100 : 0;
      return { date: dayString, attendance: parseFloat(attendance.toFixed(1)) };
    });

  }, [filteredLogs, dateRange, workersInDept]);

  const latenessData = useMemo(() => {
    const lateMap = new Map<string, number>();
    filteredLogs.filter(l => l.status === 'Late').forEach(log => {
      const day = format(log.checkIn, 'MM-dd');
      lateMap.set(day, (lateMap.get(day) || 0) + 1);
    });
    return Array.from(lateMap.entries()).map(([date, count]) => ({ date, "Late Arrivals": count }));
  }, [filteredLogs]);

  const productivityData = useMemo(() => {
      const deptHours = new Map<string, number>();
      
      const targetWorkers = department === 'all' ? workers : workers.filter(w => w.role === department);
      const rolesInFilter = Array.from(new Set(targetWorkers.map(w => w.role)));
      
      rolesInFilter.forEach(role => deptHours.set(role, 0));

      filteredLogs.forEach(log => {
          const worker = workers.find(w => w.id === log.workerId);
          if (worker && worker.role) {
            deptHours.set(worker.role, (deptHours.get(worker.role) || 0) + log.hours);
          }
      });
      return Array.from(deptHours.entries()).map(([name, totalHours]) => ({
          name,
          hours: parseFloat(totalHours.toFixed(2))
      }));
  }, [filteredLogs, workers, department]);

  return (
    <div className="p-4 md:p-8">
      <PageHeader
        title="Reports & Analytics"
        description="Visualize workforce trends and productivity."
      >
        <div className="flex items-center gap-2">
            <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download CSV
            </Button>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Download className="mr-2 h-4 w-4" />
                Download PDF
            </Button>
        </div>
      </PageHeader>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end mb-8">
        <div className="space-y-2 col-span-1 md:col-span-2">
            <label className="text-sm font-medium">Department</label>
            <Select value={department} onValueChange={setDepartment}>
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
        <div className="space-y-2 col-span-1 md:col-span-2">
            <label className="text-sm font-medium">Date Range</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal text-muted-foreground">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                        dateRange.to ? (
                            `${format(dateRange.from, "LLL dd, y")} - ${format(dateRange.to, "LLL dd, y")}`
                        ) : (
                            format(dateRange.from, "LLL dd, y")
                        )
                    ) : (
                        <span>Pick a date range</span>
                    )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                      mode="range"
                      selected={dateRange}
                      onSelect={setDateRange}
                      initialFocus
                      numberOfMonths={2}
                  />
              </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid gap-6">
        <Card className="bg-card/80">
          <CardHeader>
            <CardTitle as="h3" className="font-headline">Attendance Trends (%)</CardTitle>
            <CardDescription>Daily attendance percentage for the selected period.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <AreaChart data={attendanceTrends} accessibilityLayer margin={{ left: -20, right: 20 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} domain={[0, 100]} unit="%" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <defs>
                    <linearGradient id="fillAttendance" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1}/>
                    </linearGradient>
                </defs>
                <Area type="monotone" dataKey="attendance" stroke="hsl(var(--chart-1))" fill="url(#fillAttendance)" name="Attendance" unit="%" />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
        
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="bg-card/80">
            <CardHeader>
              <CardTitle as="h3" className="font-headline">Lateness Over Time</CardTitle>
              <CardDescription>Daily count of late arrivals.</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <LineChart data={latenessData} accessibilityLayer margin={{ left: -20, right: 20 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                  <Line type="monotone" dataKey="Late Arrivals" stroke="hsl(var(--chart-4))" strokeWidth={2} dot={{ fill: "hsl(var(--chart-4))", r: 4 }} />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="bg-card/80">
            <CardHeader>
              <CardTitle as="h3" className="font-headline">Productivity (Total Hours)</CardTitle>
              <CardDescription>Total hours worked by department for the selected period.</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <BarChart data={productivityData} layout="vertical" accessibilityLayer margin={{ left: 10 }}>
                  <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                  <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} tickMargin={8} width={80} />
                  <XAxis type="number" hide />
                  <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                  <Bar dataKey="hours" name="Total Hours" fill="hsl(var(--chart-2))" radius={4} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
