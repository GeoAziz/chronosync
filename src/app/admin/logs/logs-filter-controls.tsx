
'use client';
import { useState, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";

type LogsFilterControlsProps = {
    uniqueRoles: string[];
}

export function LogsFilterControls({ uniqueRoles }: LogsFilterControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [name, setName] = useState(searchParams.get('name') || '');
  const [role, setRole] = useState(searchParams.get('role') || '');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    if (from) return { from: new Date(from), to: to ? new Date(to) : undefined };
    return undefined;
  });
  
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (name) params.set('name', name); else params.delete('name');
    if (role) params.set('role', role); else params.delete('role');
    if (dateRange?.from) params.set('from', format(dateRange.from, 'yyyy-MM-dd')); else params.delete('from');
    if (dateRange?.to) params.set('to', format(dateRange.to, 'yyyy-MM-dd')); else params.delete('to');

    // Debounce router push
    const handler = setTimeout(() => {
       router.push(`${pathname}?${params.toString()}`);
    }, 300);

    return () => clearTimeout(handler);

  }, [name, role, dateRange, pathname, router, searchParams]);

  const clearFilters = () => {
    setName('');
    setRole('');
    setDateRange(undefined);
    router.push(pathname);
  }

  return (
    <Card className="bg-card/80 mb-8">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="space-y-2">
              <label className="text-sm font-medium">Worker Name</label>
              <Input placeholder="Filter by name..." value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
              <label className="text-sm font-medium">Department</label>
              <Select value={role} onValueChange={(value) => setRole(value === 'all' ? '' : value)}>
                  <SelectTrigger>
                      <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {uniqueRoles.map(r => (
                          <SelectItem key={r} value={r}>{r}</SelectItem>
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
  )
}
