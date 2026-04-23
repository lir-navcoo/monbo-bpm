"use client"

import * as React from "react"
import {
  IconCheck,
  IconEye,
  IconArrowForward,
} from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Task {
  id: string
  processInstId: number
  processName: string
  taskName: string
  assigneeName: string
  candidateName?: string
  status: number
  priority: number
  createdTime: string
  dueDate?: string
}

const mockData: Task[] = [
  { id: "1", processInstId: 1, processName: "请假申请流程", taskName: "部门经理审批", assigneeName: "张三", status: 1, priority: 1, createdTime: "2026-04-23 10:35", dueDate: "2026-04-25" },
  { id: "2", processInstId: 2, processName: "费用报销流程", taskName: "财务复核", assigneeName: "李四", status: 1, priority: 2, createdTime: "2026-04-23 09:20", dueDate: "2026-04-26" },
  { id: "3", processInstId: 3, processName: "请假申请流程", taskName: "HR审批", assigneeName: "孙七", candidateName: "周八", status: 2, priority: 1, createdTime: "2026-04-22 16:25" },
  { id: "4", processInstId: 4, processName: "采购申请流程", taskName: "经理审批", assigneeName: "王五", status: 1, priority: 3, createdTime: "2026-04-21 14:00" },
]

const priorityMap: Record<number, { label: string; color: string }> = {
  1: { label: "高", color: "bg-red-500 text-white" },
  2: { label: "中", color: "bg-yellow-500 text-black" },
  3: { label: "低", color: "bg-green-500 text-white" },
}

const statusMap: Record<number, { label: string }> = {
  1: { label: "待处理" },
  2: { label: "已完成" },
}

export default function TaskListPage() {
  const [searchText, setSearchText] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("1")

  const filteredData = mockData.filter((item) => {
    const matchSearch =
      !searchText ||
      item.processName.includes(searchText) ||
      item.taskName.includes(searchText) ||
      item.assigneeName.includes(searchText)
    const matchStatus = statusFilter === "all" || String(item.status) === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="flex flex-1 flex-col gap-4">
      {/* 工具栏 */}
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="搜索流程名称、任务名称..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-64"
        />
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v || "all")}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="1">待处理</SelectItem>
            <SelectItem value="2">已完成</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 列表 */}
      {filteredData.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">暂无任务</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredData.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-4 rounded-lg border bg-card p-4 hover:shadow-sm transition-shadow"
            >
              {/* 优先级 */}
              <Badge className={priorityMap[task.priority]?.color}>
                {priorityMap[task.priority]?.label}
              </Badge>

              {/* 任务信息 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{task.taskName}</span>
                  <Badge variant="outline" className="text-xs">
                    {task.processName}
                  </Badge>
                  {task.status === 2 && (
                    <Badge variant="secondary" className="text-xs">
                      {statusMap[task.status]?.label}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                  <span>办理人：{task.assigneeName}</span>
                  {task.candidateName && <span>候选：{task.candidateName}</span>}
                  <span>{task.createdTime}</span>
                  {task.dueDate && (
                    <span className={task.status === 1 ? "text-orange-500" : ""}>
                      截止：{task.dueDate}
                    </span>
                  )}
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="size-8">
                  <IconEye className="size-4" />
                </Button>
                {task.status === 1 && (
                  <>
                    <Button variant="ghost" size="icon" className="size-8 text-green-500">
                      <IconCheck className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="size-8 text-blue-500">
                      <IconArrowForward className="size-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
