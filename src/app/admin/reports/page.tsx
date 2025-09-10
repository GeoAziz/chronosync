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

const trendsData = [
  { month: "May", attendance: 82 },
  { month: "Jun", attendance: 88 },
  { month: "Jul", attendance: 91 },
  { month: "Aug", attendance: 85 },
];

const latenessData = [
  { date: "08-01", count: 5 },
  { date: "08-02", count: 8 },
  { date: "08-03", count: 4 },
  { date: "08-04", count: 9 },
  { date: "08-05", count: 12 },
  { date: "08-06", count: 10 },
];

const productivityData = [
    { name: 'Technicians', hours: 8.2 },
    { name: 'Engineers', hours: 9.1 },
    { name: 'Supervisors', hours: 8.5 },
    { name: 'Analysts', hours: 8.8 },
];

const chartConfig: ChartConfig = {
  attendance: { label: "Attendance %", color: "hsl(var(--chart-1))" },
  count: { label: "Late Arrivals", color: "hsl(var(--chart-4))" },
  hours: { label: "Avg. Hours", color: "hsl(var(--chart-2))" },
};

export default function AdminReportsPage() {
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
            <Select>
                <SelectTrigger>
                    <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="technicians">Technicians</SelectItem>
                </SelectContent>
            </Select>
        </div>
        <div className="space-y-2 col-span-1 md:col-span-2">
            <label className="text-sm font-medium">Date Range</label>
            <Button variant="outline" className="w-full justify-start text-left font-normal text-muted-foreground">
                <CalendarIcon className="mr-2 h-4 w-4" />
                <span>Last 30 days</span>
            </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <Card className="bg-card/80">
          <CardHeader>
            <CardTitle as="h3" className="font-headline">Attendance Trends (%)</CardTitle>
            <CardDescription>Monthly attendance percentage over time.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <AreaChart data={trendsData} accessibilityLayer margin={{ left: -20, right: 20 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <defs>
                    <linearGradient id="fillAttendance" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1}/>
                    </linearGradient>
                </defs>
                <Area type="monotone" dataKey="attendance" stroke="hsl(var(--chart-1))" fill="url(#fillAttendance)" />
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
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="count" stroke="hsl(var(--chart-4))" strokeWidth={2} dot={{ fill: "hsl(var(--chart-4))", r: 4 }} />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="bg-card/80">
            <CardHeader>
              <CardTitle as="h3" className="font-headline">Productivity (Avg. Hours)</CardTitle>
              <CardDescription>Average hours worked by department.</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <BarChart data={productivityData} layout="vertical" accessibilityLayer margin={{ left: 10 }}>
                  <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                  <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} tickMargin={8} width={80} />
                  <XAxis type="number" hide />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="hours" fill="hsl(var(--chart-2))" radius={4} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
