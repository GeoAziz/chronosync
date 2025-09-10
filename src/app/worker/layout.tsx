import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { FuturisticBackground } from '@/components/futuristic-background';

export default function WorkerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <div className="relative flex min-h-screen w-full">
        <FuturisticBackground />
        <AppSidebar role="worker" />
        <SidebarInset className="flex-1">{children}</SidebarInset>
      </div>
    </SidebarProvider>
  );
}
