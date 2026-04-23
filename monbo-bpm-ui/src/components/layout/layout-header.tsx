"use client"

import { SidebarTrigger } from '@/components/ui/sidebar';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { useLocation } from 'react-router-dom';

const routeNames: Record<string, string> = {
    '/': '仪表盘',
    '/users': '用户管理',
    '/roles': '角色管理',
    '/departments': '部门管理',
    '/process-defs': '流程定义',
    '/process-insts': '流程实例',
    '/tasks': '我的任务',
};

export function LayoutHeader({ className }: { className?: string }) {
    const location = useLocation();

    return (
        <header className={"flex h-16 shrink-0 items-center gap-2 border-b " + className}>
            <div className="flex items-center gap-2 px-3">
            <SidebarTrigger />
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/">首页</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>{routeNames[location.pathname] || location.pathname}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            </div>
        </header>
    );
}
