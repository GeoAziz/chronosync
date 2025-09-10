'use client';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Flame, Power, LogIn } from 'lucide-react';
import { workerTasks } from '@/lib/mock-data';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { signInAction, signOutAction } from '@/lib/actions';
import type { AttendanceLog, Worker } from '@/lib/types';
import { useRouter } from 'next/navigation';

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'Completed': return 'secondary';
    case 'In Progress': return 'default';
    case 'Overdue': return 'destructive';
    default: return 'outline';
  }
};

interface WorkerDashboardClientProps {
  worker: Worker;
  attendanceLog: (AttendanceLog & { id: string }) | null;
  streak: number;
}

export function WorkerDashboardClient({ worker, attendanceLog, streak }: WorkerDashboardClientProps) {
  const router = useRouter();
  const currentTask = workerTasks[0];
  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const isSignedIn = !!attendanceLog && !attendanceLog.checkOut;
  const isSignedOut = !!attendanceLog && !!attendanceLog.checkOut;

  return (
    <div className="p-4 md:p-8">
      <PageHeader
        title={`Good morning, ${worker.name}`}
        description={dateString}
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 grid gap-4">
          <Card className="bg-card/80 border-accent/20">
            <CardHeader>
              <CardTitle as="h3" className="font-headline">Your Status</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {isSignedIn ? (
                    <>
                    <div className="p-2 bg-green-500/10 rounded-full">
                        <CheckCircle2 className="h-8 w-8 text-green-400" />
                    </div>
                    <div>
                        <p className="font-semibold">Signed In</p>
                        <p className="text-sm text-muted-foreground">at {attendanceLog?.checkIn.toLocaleTimeString()}</p>
                    </div>
                    </>
                ) : (
                     <>
                    <div className="p-2 bg-gray-500/10 rounded-full">
                        <Power className="h-8 w-8 text-gray-400" />
                    </div>
                    <div>
                        <p className="font-semibold">{isSignedOut ? `Signed out at ${attendanceLog.checkOut?.toLocaleTimeString()}`: "Not Signed In"}</p>
                        <p className="text-sm text-muted-foreground">Ready for a new day!</p>
                    </div>
                    </>
                )}
              </div>
                <form action={async (formData: FormData) => {
                    'use server';
                    const result = await (isSignedIn ? signOutAction(formData) : signInAction(formData));
                    if (result.success) {
                      router.refresh();
                    }
                }}>
                    {isSignedIn ? (
                        <>
                            <input type="hidden" name="logId" value={attendanceLog?.id || ''} />
                            <input type="hidden" name="workerId" value={worker.id} />
                        </>
                    ) : (
                        <>
                            <input type="hidden" name="workerId" value={worker.id} />
                            <input type="hidden" name="workerName" value={worker.name} />
                        </>
                    )}
                    <Button type="submit" size="lg" className="w-full sm:w-auto bg-primary/20 text-primary-foreground border border-primary hover:bg-primary/30" disabled={isSignedOut}>
                        {isSignedIn ? <Power className="mr-2 h-5 w-5" /> : <LogIn className="mr-2 h-5 w-5" />}
                        {isSignedIn ? 'Sign Out' : 'Sign In'}
                    </Button>
                </form>
            </CardContent>
          </Card>
          
          <Card className="bg-card/80 border-primary/10">
            <CardHeader>
              <CardTitle as="h3" className="font-headline">Upcoming Task</CardTitle>
              <CardDescription>Your next priority assignment.</CardDescription>
            </CardHeader>
            <CardContent>
              <h3 className="text-lg font-semibold">{currentTask.name}</h3>
              <p className="text-sm text-muted-foreground">Deadline: {currentTask.deadline}</p>
              <div className="mt-4 flex items-center gap-4">
                <Progress value={currentTask.progress} className="h-2 bg-primary/20" />
                <span className="font-semibold">{currentTask.progress}%</span>
                <Badge variant={getStatusBadgeVariant(currentTask.status)}>{currentTask.status}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card/80 border-primary/10 flex flex-col items-center justify-center text-center p-6">
          <div className="p-4 rounded-full bg-orange-500/10">
            <Flame className="h-16 w-16 text-orange-400" />
          </div>
          <p className="text-5xl font-bold mt-4">{streak}</p>
          <p className="text-muted-foreground mt-2 font-headline">day attendance streak</p>
          <p className="text-sm mt-4">Keep up the great work!</p>
        </Card>
      </div>
    </div>
  );
}
