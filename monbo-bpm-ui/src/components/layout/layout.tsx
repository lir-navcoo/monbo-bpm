"use client"

import { Outlet } from 'react-router-dom';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './app-sidebar';
import { LayoutHeader } from './layout-header';

export default function Layout() {
    return (
            <SidebarProvider defaultOpen={true} className="h-screen overflow-hidden">
            <AppSidebar />
            <SidebarInset className="flex flex-col h-full overflow-hidden">
                <LayoutHeader className="flex-shrink-0"/>
                <main className="flex-1 p-4 overflow-y-auto">
                    <Outlet />
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
