
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, ClipboardList } from "lucide-react";
import { getDashboardData } from "@/lib/get-dashboard-data";
import type { Task } from "@/lib/types";

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'Completed': return 'default';
    case 'In Progress': return 'secondary';
    case 'Overdue': return 'destructive';
    default: return 'outline';
  }
};

export default async function WorkerTasksPage() {
    const data = await getDashboardData();

    if (!data) {
        return <div className="p-8">Could not load worker data. Please sign in again.</div>
    }

    const { tasks } = data;

  return (
    <div className="p-4 md:p-8">
      <PageHeader
        title="My Tasks"
        description="A list of your current and upcoming assignments."
      />
      <div className="grid gap-6">
        {tasks.length > 0 ? (
            tasks.map((task: Task) => (
                <Card key={task.id} className="bg-card/80 border-primary/10 transition-all hover:border-primary/30">
                    <CardHeader>
                    <CardTitle as="h3" className="font-headline flex items-center justify-between">
                        <span>{task.name}</span>
                        <Badge variant={getStatusBadgeVariant(task.status)}>{task.status}</Badge>
                    </CardTitle>
                    <CardDescription>Deadline: {task.deadline}</CardDescription>
                    </CardHeader>
                    <CardContent>
                    {task.status === 'Completed' ? (
                        <div className="flex items-center gap-2 text-green-400">
                            <CheckCircle2 className="h-5 w-5"/>
                            <p className="font-semibold">Task Finished</p>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                        <Progress value={task.progress} className="h-2 bg-primary/20" />
                        <span className="text-sm font-semibold text-muted-foreground">{task.progress}%</span>
                        </div>
                    )}
                    </CardContent>
                </Card>
            ))
        ) : (
             <Card className="bg-card/80 col-span-full">
                <CardContent className="py-16 text-center">
                    <ClipboardList className="mx-auto h-16 w-16 text-muted-foreground" />
                    <h3 className="mt-4 text-xl font-semibold">No Tasks Found</h3>
                    <p className="mt-2 text-muted-foreground">You don't have any assigned tasks at the moment.</p>
                </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
}
