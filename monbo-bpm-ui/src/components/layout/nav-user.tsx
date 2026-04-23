import {
    ChevronsUpDown,
    LogOut,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "@/store/auth"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"

export function NavUser({
    user,
}: {
    user?: {
        name: string
        email: string
        avatar: string
    }
}) {
    const { isMobile } = useSidebar()
    const navigate = useNavigate()
    const { username, logout } = useAuthStore()

    const displayName = username || user?.name || "User"
    const displayEmail = user?.email || ""

    function handleLogout() {
        logout()
        navigate("/login")
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger className="w-full">
                        <div
                            role="button"
                            tabIndex={0}
                            className="flex items-center gap-2 px-2 py-1.5 text-left data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground w-full cursor-pointer rounded-lg transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        >
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarFallback className="rounded-lg">{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-sm leading-tight">
                                <span className="truncate font-medium">{displayName}</span>
                                {displayEmail && <span className="truncate text-xs opacity-60">{displayEmail}</span>}
                            </div>
                            <ChevronsUpDown className="ml-auto size-4 opacity-60" />
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarFallback className="rounded-lg">{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">{displayName}</span>
                                {displayEmail && <span className="truncate text-xs opacity-60">{displayEmail}</span>}
                            </div>
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>
                            <LogOut />
                            退出登录
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
