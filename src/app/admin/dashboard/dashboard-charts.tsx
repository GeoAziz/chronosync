'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

type CumulativeAttendanceData = {
  time: string;
  signedIn: number;
  late: number;
};

type PieData = {
    name: string;
    value: number;
    fill: string;
};

type DashboardChartsProps = {
    cumulativeAttendance: CumulativeAttendanceData[];
    pieData: PieData[]
};

const chartConfig: ChartConfig = {
    signedIn: { label: 'Signed In', color: 'hsl(var(--chart-2))' },
    late: { label: 'Late', color: 'hsl(var(--chart-4))' },
};

export function DashboardCharts({ cumulativeAttendance, pieData }: DashboardChartsProps) {
    return (
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <Card className="bg-card/80">
            <CardHeader>
                <CardTitle as="h3" className="font-headline">Sign-In Trends by Hour</CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <BarChart data={cumulativeAttendance} accessibilityLayer>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                    <XAxis dataKey="time" tickLine={false} tickMargin={10} axisLine={false} />
                    <YAxis tickLine={false} tickMargin={10} axisLine={false} />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="signedIn" fill="var(--color-signedIn)" radius={4} />
                    <Bar dataKey="late" fill="var(--color-late)" radius={4} />
                </BarChart>
                </ChartContainer>
            </CardContent>
            </Card>

            <Card className="bg-card/80">
            <CardHeader>
                <CardTitle as="h3" className="font-headline">Today's Workforce Status</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
                <ChartContainer config={chartConfig} className="h-[250px] w-full">
                    <PieChart accessibilityLayer>
                        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                        <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={5} >
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill as string} />
                            ))}
                        </Pie>
                        <ChartLegend content={<ChartLegendContent />} />
                    </PieChart>
                </ChartContainer>
            </CardContent>
            </Card>
      </div>
    )
}
