import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { FuturisticBackground } from '@/components/futuristic-background';

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <div className="relative flex min-h-screen w-full">
        <FuturisticBackground />
        <AppSidebar role="admin" />
        <SidebarInset className="flex-1">{children}</SidebarInset>
      </div>
    </SidebarProvider>
  );
}
