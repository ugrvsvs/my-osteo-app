'use client';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Users, Library, FileStack, LayoutDashboard } from 'lucide-react';
import { Logo } from '@/components/app/logo';
import { UserNav } from '@/components/app/user-nav';
import { Button } from '@/components/ui/button';
import { useUser } from '@/firebase';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  if (loading || !user) {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <p>Загрузка...</p>
        </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="/dashboard">
                  <LayoutDashboard /> Пациенты
                </Link>
              </Button>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="/dashboard/library">
                  <Library /> Библиотека
                </Link>
              </Button>
            </SidebarMenuItem>
            <SidebarMenuItem>
             <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="/dashboard/templates">
                  <FileStack /> Шаблоны
                </Link>
              </Button>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1" />
          <UserNav />
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
