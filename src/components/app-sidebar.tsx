'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Home, ClipboardList, CalendarClock, LayoutDashboard, Users, BarChart3, Settings, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

type NavItem = {
  href: string;
  icon: React.ElementType;
  label: string;
};

const workerNavItems: NavItem[] = [
  { href: '/worker/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/worker/attendance', icon: CalendarClock, label: 'My Attendance' },
  { href: '/worker/tasks', icon: ClipboardList, label: 'My Tasks' },
];

const adminNavItems: NavItem[] = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/workers', icon: Users, label: 'Worker Management' },
  { href: '/admin/logs', icon: CalendarClock, label: 'Attendance Logs' },
  { href: '/admin/reports', icon: BarChart3, label: 'Reports' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
];

const UserProfile = ({ role }: { role: 'worker' | 'admin' }) => (
  <div className="flex items-center gap-3 p-2">
    <Avatar>
      <AvatarImage src={`https://picsum.photos/seed/${role}/40/40`} data-ai-hint="profile person" />
      <AvatarFallback>{role === 'admin' ? 'A' : 'W'}</AvatarFallback>
    </Avatar>
    <div className="flex flex-col overflow-hidden">
      <span className="font-semibold text-sm truncate">{role === 'admin' ? 'Admin User' : 'Worker Bee'}</span>
      <span className="text-xs text-muted-foreground truncate">{role === 'admin' ? 'Administrator' : 'Technician'}</span>
    </div>
  </div>
);

export function AppSidebar({ role }: { role: 'worker' | 'admin' }) {
  const pathname = usePathname();
  const router = useRouter();
  const navItems = role === 'worker' ? workerNavItems : adminNavItems;

  const handleLogout = async () => {
    // Sign out from Firebase client
    await signOut(auth);
    // Sign out from server session
    await fetch('/api/auth/sign-out', { method: 'POST' });
    // Redirect to login page
    router.push('/login');
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center justify-between p-2">
          <Logo />
          <SidebarTrigger />
        </div>
        <UserProfile role={role} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={pathname.startsWith(item.href)} tooltip={item.label}>
                    <Link href={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} tooltip="Logout">
                    <LogOut />
                    <span>Logout</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
