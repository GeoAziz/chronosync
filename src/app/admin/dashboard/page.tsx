
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DashboardCharts } from './dashboard-charts';
import { db, initAdmin } from '@/lib/firebase-admin';
import type { Worker, AttendanceLog } from '@/lib/types';
import { Timestamp } from 'firebase-admin/firestore';

initAdmin();

const quickLinks = [
    { href: "/admin/reports", label: "View Reports" },
    { href: "/admin/workers", label: "Manage Workers" },
    { href: "/admin/logs", label: "See All Logs" },
];

async function getDashboardData() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const workersSnapshot = await db.collection('workers').get();
    const workers = workersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Worker));

    const logsSnapshot = await db.collection('attendance-logs')
        .where('checkIn', '>=', Timestamp.fromDate(today))
        .where('checkIn', '<', Timestamp.fromDate(tomorrow))
        .get();
    
    const logs = logsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            checkIn: (data.checkIn as Timestamp).toDate(),
            checkOut: data.checkOut ? (data.checkOut as Timestamp).toDate() : null,
        } as AttendanceLog;
    });

    return { workers, logs };
}

export default async function AdminDashboardPage() {
  const { workers, logs } = await getDashboardData();
  const date = new Date();
  const dateString = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const totalWorkers = workers.length;
  const workersPresent = logs.length;
  const lateArrivals = logs.filter(log => {
      const checkInTime = new Date(log.checkIn);
      return checkInTime.getHours() > 9 || (checkInTime.getHours() === 9 && checkInTime.getMinutes() > 0);
  }).length;
  const presentPercentage = totalWorkers > 0 ? ((workersPresent / totalWorkers) * 100).toFixed(0) : 0;
  
  const attendanceByHour = [
      { time: '08:00', signedIn: 0, late: 0 },
      { time: '09:00', signedIn: 0, late: 0 },
      { time: '10:00', signedIn: 0, late: 0 },
      { time: '11:00', signedIn: 0, late: 0 },
  ];

  logs.forEach(log => {
      const checkInTime = new Date(log.checkIn);
      const hour = checkInTime.getHours();
      if (hour >= 8 && hour < 12) {
          const index = hour - 8;
          if(index >= 0 && index < attendanceByHour.length) {
              const isLate = checkInTime.getHours() > 9 || (checkInTime.getHours() === 9 && checkInTime.getMinutes() > 0);
              if (isLate) {
                  attendanceByHour[index].late++;
              } else {
                  attendanceByHour[index].signedIn++;
              }
          }
      }
  });

  const cumulativeAttendance = attendanceByHour.reduce((acc, curr, index) => {
    if (index === 0) {
      acc.push({ ...curr });
    } else {
      acc.push({
        time: curr.time,
        signedIn: acc[index - 1].signedIn + curr.signedIn,
        late: acc[index - 1].late + curr.late,
      });
    }
    return acc;
  }, [] as typeof attendanceByHour);
  
  const pieData = [
      { name: 'Signed In', value: workersPresent, fill: 'hsl(var(--chart-2))' },
      { name: 'Absent', value: totalWorkers - workersPresent, fill: 'hsl(var(--muted))' },
  ]

  return (
    <div className="p-4 md:p-8">
      <PageHeader
        title="Admin Dashboard"
        description={`Here's a snapshot of your workforce today, ${dateString}.`}
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card/80 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Workers Today</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workersPresent} / {totalWorkers}</div>
            <p className="text-xs text-muted-foreground">{presentPercentage}% of total workforce present</p>
          </CardContent>
        </Card>
        <Card className="bg-card/80 border-accent/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">% Signed In</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{presentPercentage}%</div>
            <p className="text-xs text-muted-foreground">Of workers expected today</p>
          </CardContent>
        </Card>
        <Card className="bg-card/80 border-destructive/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Late Arrivals</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lateArrivals}</div>
            <p className="text-xs text-muted-foreground">Check-ins after 09:00 AM</p>
          </CardContent>
        </Card>
        <Card className="bg-card/80">
            <CardHeader>
                <CardTitle className="text-sm font-medium">Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
                {quickLinks.map(link => (
                    <Button asChild key={link.href} variant="ghost" className="justify-start gap-2 text-muted-foreground hover:text-foreground">
                        <Link href={link.href}><ArrowRight className="h-4 w-4" />{link.label}</Link>
                    </Button>
                ))}
            </CardContent>
        </Card>
      </div>

      <DashboardCharts 
        cumulativeAttendance={cumulativeAttendance}
        pieData={pieData}
      />
    </div>
  );
}
