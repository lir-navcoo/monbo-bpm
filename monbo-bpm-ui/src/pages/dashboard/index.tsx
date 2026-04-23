import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutDashboard, Users, Shield, PlayCircle, CheckSquare } from "lucide-react";
import { fetchDashboardStats, fetchPendingTasks, fetchRecentProcessInstances } from "@/lib/api";
import type { DashboardStats, RecentProcessInstance, PendingTask } from "@/lib/api";

const statCards = [
  { key: "totalUsers", title: "总用户数", icon: Users, label: "用户" },
  { key: "totalProcessInstances", title: "流程实例", icon: PlayCircle, label: "实例" },
  { key: "pendingTasks", title: "待办任务", icon: CheckSquare, label: "任务" },
  { key: "totalRoles", title: "角色数", icon: Shield, label: "角色" },
] as const;

function formatDate(dateStr: string) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function getStatusBadge(status: string) {
  const map: Record<string, string> = {
    COMPLETED: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    RUNNING: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    SUSPENDED: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    CANCELED: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  };
  return map[status] ?? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
}

function getPriorityBadge(priority: number) {
  if (priority >= 50) return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
  if (priority >= 20) return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
  return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentProcs, setRecentProcs] = useState<RecentProcessInstance[]>([]);
  const [pendingTasks, setPendingTasks] = useState<PendingTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchDashboardStats(),
      fetchRecentProcessInstances(5),
      fetchPendingTasks(5),
    ]).then(([s, p, t]) => {
      setStats(s);
      setRecentProcs(p);
      setPendingTasks(t);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="size-5" />
          <h1 className="text-2xl font-bold">仪表盘</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 w-20 bg-muted rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted rounded mb-1" />
                <div className="h-3 w-24 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map(({ key, title, icon: Icon }) => (
          <Card key={key}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{title}</CardTitle>
              <Icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{typeof stats?.[key] === "number" ? stats?.[key] : "-"}</div>
              <p className="text-xs text-muted-foreground">实时数据</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 下方两列 */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* 最近流程实例 */}
        <Card>
          <CardHeader>
            <CardTitle>最近流程实例</CardTitle>
          </CardHeader>
          <CardContent>
            {recentProcs.length === 0 ? (
              <p className="text-sm text-muted-foreground">暂无数据</p>
            ) : (
              <div className="space-y-2">
                {recentProcs.map((proc) => (
                  <div key={proc.id} className="flex items-center justify-between text-sm py-1.5 border-b last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium">{proc.businessKey || proc.processDefinitionKey}</p>
                      <p className="text-xs text-muted-foreground truncate">{proc.processDefinitionName}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-2 shrink-0">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${getStatusBadge(proc.status)}`}>
                        {proc.status}
                      </span>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(proc.startTime)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 待办任务 */}
        <Card>
          <CardHeader>
            <CardTitle>待办任务</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">暂无数据</p>
            ) : (
              <div className="space-y-2">
                {pendingTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between text-sm py-1.5 border-b last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium">{task.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                         assignee: {task.assignee || "未分配"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-2 shrink-0">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${getPriorityBadge(task.priority)}`}>
                        P{task.priority}
                      </span>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(task.createTime)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
