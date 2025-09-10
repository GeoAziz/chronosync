import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { workerTasks } from "@/lib/mock-data";
import { CheckCircle2 } from "lucide-react";

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'Completed': return 'default';
    case 'In Progress': return 'secondary';
    case 'Overdue': return 'destructive';
    default: return 'outline';
  }
};

export default function WorkerTasksPage() {
  return (
    <div className="p-4 md:p-8">
      <PageHeader
        title="My Tasks"
        description="A list of your current and upcoming assignments."
      />
      <div className="grid gap-6">
        {workerTasks.map((task, index) => (
          <Card key={index} className="bg-card/80 border-primary/10 transition-all hover:border-primary/30">
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
        ))}
      </div>
    </div>
  );
}
