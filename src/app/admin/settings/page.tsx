
'use client';
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Upload, Loader2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import type { Worker } from "@/lib/types";
import { updateWorkerAction } from "@/lib/actions";

type SettingsForm = {
  orgName: string;
  departments: string;
  lateArrivalAlerts: boolean;
  weeklySummary: boolean;
  absenteeReport: boolean;
};

export default function AdminSettingsPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const { register, handleSubmit, control, reset } = useForm<SettingsForm>({
    defaultValues: {
      orgName: '',
      departments: '',
      lateArrivalAlerts: true,
      weeklySummary: true,
      absenteeReport: false,
    }
  });

  useEffect(() => {
    const unsubSettings = onSnapshot(doc(db, 'settings', 'organization'), (doc) => {
      if (doc.exists()) {
        reset(doc.data() as SettingsForm);
      }
    });

    const unsubWorkers = onSnapshot(collection(db, 'workers'), (snapshot) => {
        setWorkers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Worker)));
    });

    return () => {
      unsubSettings();
      unsubWorkers();
    };
  }, [reset]);

  const onSubmit = async (data: SettingsForm) => {
    setIsSubmitting(true);
    try {
      await setDoc(doc(db, 'settings', 'organization'), data);
      toast({ title: 'Success', description: 'Settings saved successfully.' });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({ title: 'Error', description: 'Failed to save settings.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleChange = async (workerId: string, role: string) => {
      const worker = workers.find(w => w.id === workerId);
      if (!worker) return;
      
      const result = await updateWorkerAction({ id: worker.id, name: worker.name, role: role });
      if (result.success) {
          toast({ title: "Role Updated", description: `${worker.name}'s role has been changed to ${role}.`});
      } else {
          toast({ title: "Error", description: result.error, variant: "destructive" });
      }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-4 md:p-8">
      <PageHeader
        title="Admin Settings"
        description="Manage your organization's settings and preferences."
      />
      
      <div className="grid gap-8">
        <Card className="bg-card/80">
          <CardHeader>
            <CardTitle as="h3" className="font-headline">Organization Info</CardTitle>
            <CardDescription>Update your company's details and branding.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="org-name">Organization Name</Label>
              <Input id="org-name" {...register("orgName")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-logo">Organization Logo</Label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center">
                    <p className="font-bold text-2xl">C</p>
                </div>
                <Button variant="outline" type="button">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Logo
                </Button>
              </div>
            </div>
             <div className="space-y-2">
              <Label htmlFor="org-departments">Departments</Label>
              <Input id="org-departments" {...register("departments")} />
              <p className="text-xs text-muted-foreground">Comma-separated list of departments.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/80">
          <CardHeader>
            <CardTitle as="h3" className="font-headline">Role Management</CardTitle>
            <CardDescription>Change the roles of users in your system.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {workers.map(worker => (
              <div key={worker.id} className="flex items-center justify-between">
                  <div>
                      <p className="font-medium">{worker.name}</p>
                      <p className="text-sm text-muted-foreground">{worker.email}</p>
                  </div>
                  <Select value={worker.role} onValueChange={(value) => handleRoleChange(worker.id, value)}>
                      <SelectTrigger className="w-[180px]">
                          <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="Technician">Technician</SelectItem>
                          <SelectItem value="Engineer">Engineer</SelectItem>
                          <SelectItem value="Supervisor">Supervisor</SelectItem>
                          <SelectItem value="Analyst">Analyst</SelectItem>
                          <SelectItem value="Administrator">Administrator</SelectItem>
                      </SelectContent>
                  </Select>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card/80">
          <CardHeader>
            <CardTitle as="h3" className="font-headline">Notification Preferences</CardTitle>
            <CardDescription>Manage how you receive notifications from the system.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Controller
              control={control}
              name="lateArrivalAlerts"
              render={({ field }) => (
                <div className="flex items-center justify-between p-4 rounded-md bg-background">
                  <div>
                      <Label htmlFor="late-arrival-notif" className="font-medium">Late Arrival Alerts</Label>
                      <p className="text-sm text-muted-foreground">Receive an email when a worker signs in late.</p>
                  </div>
                  <Switch id="late-arrival-notif" checked={field.value} onCheckedChange={field.onChange} />
                </div>
              )}
            />
            <Controller
              control={control}
              name="weeklySummary"
              render={({ field }) => (
                <div className="flex items-center justify-between p-4 rounded-md bg-background">
                  <div>
                      <Label htmlFor="weekly-summary-notif" className="font-medium">Weekly Summary</Label>
                      <p className="text-sm text-muted-foreground">Get a weekly report of workforce activity.</p>
                  </div>
                  <Switch id="weekly-summary-notif" checked={field.value} onCheckedChange={field.onChange} />
                </div>
              )}
            />
             <Controller
              control={control}
              name="absenteeReport"
              render={({ field }) => (
                <div className="flex items-center justify-between p-4 rounded-md bg-background">
                  <div>
                      <Label htmlFor="absentee-notif" className="font-medium">Absentee Report</Label>
                      <p className="text-sm text-muted-foreground">Daily report of workers who did not sign in.</p>
                  </div>
                  <Switch id="absentee-notif" checked={field.value} onCheckedChange={field.onChange} />
                </div>
              )}
            />
          </CardContent>
        </Card>
      </div>

       <div className="mt-8 flex justify-end">
          <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90" disabled={isSubmitting}>
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Saving...</> : 'Save Changes'}
          </Button>
       </div>
    </form>
  );
}
