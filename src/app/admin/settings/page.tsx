import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Upload } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="p-4 md:p-8">
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
              <Input id="org-name" defaultValue="ChronoSync Corp" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-logo">Organization Logo</Label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center">
                    <p className="font-bold text-2xl">C</p>
                </div>
                <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Logo
                </Button>
              </div>
            </div>
             <div className="space-y-2">
              <Label htmlFor="org-departments">Departments</Label>
              <Input id="org-departments" defaultValue="Engineering, Technicians, Supervisors, Analysts" />
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
            <div className="flex items-center justify-between">
                <div>
                    <p className="font-medium">Tyrion Lannister</p>
                    <p className="text-sm text-muted-foreground">tyrion@chronosync.io</p>
                </div>
                <Select defaultValue="Administrator">
                    <SelectTrigger className="w-[180px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Worker">Worker</SelectItem>
                        <SelectItem value="Administrator">Administrator</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/80">
          <CardHeader>
            <CardTitle as="h3" className="font-headline">Notification Preferences</CardTitle>
            <CardDescription>Manage how you receive notifications from the system.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-md bg-background">
                <div>
                    <Label htmlFor="late-arrival-notif" className="font-medium">Late Arrival Alerts</Label>
                    <p className="text-sm text-muted-foreground">Receive an email when a worker signs in late.</p>
                </div>
                <Switch id="late-arrival-notif" defaultChecked />
            </div>
            <div className="flex items-center justify-between p-4 rounded-md bg-background">
                <div>
                    <Label htmlFor="weekly-summary-notif" className="font-medium">Weekly Summary</Label>
                    <p className="text-sm text-muted-foreground">Get a weekly report of workforce activity.</p>
                </div>
                <Switch id="weekly-summary-notif" defaultChecked />
            </div>
             <div className="flex items-center justify-between p-4 rounded-md bg-background">
                <div>
                    <Label htmlFor="absentee-notif" className="font-medium">Absentee Report</Label>
                    <p className="text-sm text-muted-foreground">Daily report of workers who did not sign in.</p>
                </div>
                <Switch id="absentee-notif" />
            </div>
          </CardContent>
        </Card>
      </div>

       <div className="mt-8 flex justify-end">
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90">Save Changes</Button>
       </div>
    </div>
  );
}
