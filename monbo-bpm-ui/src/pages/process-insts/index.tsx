"use client"

import * as React from "react"
import {
  IconX,
  IconEye,
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

interface ProcessInst {
  id: number
  processDefId: number
  processName: string
  businessKey: string
  starterName: string
  status: number
  createdTime: string
}

const mockData: ProcessInst[] = [
  { id: 1, processDefId: 1, processName: "请假申请流程", businessKey: "LEAVE-2026-001", starterName: "张三", status: 1, createdTime: "2026-04-23 10:30" },
  { id: 2, processDefId: 2, processName: "费用报销流程", businessKey: "EXP-2026-001", starterName: "李四", status: 2, createdTime: "2026-04-23 09:15" },
  { id: 3, processDefId: 1, processName: "请假申请流程", businessKey: "LEAVE-2026-002", starterName: "王五", status: 1, createdTime: "2026-04-22 16:20" },
]

const statusMap: Record<number, { label: string; color: string }> = {
  1: { label: "运行中", color: "bg-blue-500" },
  2: { label: "已完成", color: "bg-green-500" },
  3: { label: "已取消", color: "bg-gray-500" },
}



export default function ProcessInstListPage() {
  const [searchText, setSearchText] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")

  const filteredData = mockData.filter((item) => {
    const matchSearch =
      !searchText ||
      item.processName.includes(searchText) ||
      item.businessKey.includes(searchText) ||
      item.starterName.includes(searchText)
    const matchStatus = statusFilter === "all" || String(item.status) === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="flex flex-1 flex-col gap-4">
      {/* 工具栏 */}
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="搜索流程名称、业务Key、发起人..."
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
            <SelectItem value="1">运行中</SelectItem>
            <SelectItem value="2">已完成</SelectItem>
            <SelectItem value="3">已取消</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 列表 */}
      {filteredData.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">暂无流程实例</p>
        </div>
      ) : (
        <div className="rounded-lg border bg-card">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">业务Key</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">流程名称</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">发起人</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">状态</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">创建时间</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item) => (
                <tr key={item.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 text-sm font-mono">{item.businessKey}</td>
                  <td className="px-4 py-3 text-sm">{item.processName}</td>
                  <td className="px-4 py-3 text-sm">{item.starterName}</td>
                  <td className="px-4 py-3">
                    <Badge className={`${statusMap[item.status]?.color} text-white`}>
                      {statusMap[item.status]?.label}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{item.createdTime}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="size-8">
                        <IconEye className="size-4" />
                      </Button>
                      {item.status === 1 && (
                        <Button variant="ghost" size="icon" className="size-8 text-red-500">
                          <IconX className="size-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
