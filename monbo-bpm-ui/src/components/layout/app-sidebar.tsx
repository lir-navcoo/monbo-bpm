import * as React from "react"
import { useLocation, useNavigate } from "react-router-dom"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { NavUser } from "./nav-user"
import { GalleryVerticalEnd } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  title: string
  url: string
  isActive?: boolean
}

interface NavGroup {
  title: string
  url: string
  items: NavItem[]
}

// Monbo BPM 导航数据
const data: { versions: string[]; navMain: NavGroup[] } = {
  versions: ["1.0.0"],
  navMain: [
    {
      title: "仪表盘",
      url: "/",
      items: [
        {
          title: "首页",
          url: "/",
        },
      ],
    },
    {
      title: "流程管理",
      url: "#",
      items: [
        {
          title: "流程定义",
          url: "/process-defs",
        },
        {
          title: "流程实例",
          url: "/process-insts",
        },
        {
          title: "我的任务",
          url: "/tasks",
        },
      ],
    },
    {
      title: "系统管理",
      url: "#",
      items: [
        {
          title: "用户管理",
          url: "/users",
        },
        {
          title: "角色管理",
          url: "/roles",
        },
        {
          title: "部门管理",
          url: "/departments",
        },
      ],
    },
  ],
}

// 判断当前路由是否激活
function isRouteActive(pathname: string, itemUrl: string): boolean {
  if (itemUrl === "/") {
    return pathname === "/"
  }
  return pathname === itemUrl
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation()
  const navigate = useNavigate()

  const handleNavClick = (url: string) => {
    navigate(url, { replace: true })
  }

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        {/* <SearchForm /> */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <GalleryVerticalEnd className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-medium">Monbo BPM</span>
                <span className="">v1.0.0</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* We create a SidebarGroup for each parent. */}
        {data.navMain.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const active = isRouteActive(location.pathname, item.url)
                  return (
                    <SidebarMenuItem key={item.title}>
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => handleNavClick(item.url)}
                        onKeyDown={(e) => e.key === "Enter" && handleNavClick(item.url)}
                        data-active={active}
                        className={cn(
                          "peer/menu-button group/menu-button flex w-full cursor-pointer items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm ring-sidebar-ring outline-hidden transition-[width,height,padding] group-has-data-[sidebar=menu-action]/menu-item:pr-8 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground data-active:bg-sidebar-accent data-active:font-medium data-active:text-sidebar-accent-foreground [&>span:last-child]:truncate",
                          active ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground" : ""
                        )}
                      >
                        <span>{item.title}</span>
                      </div>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
