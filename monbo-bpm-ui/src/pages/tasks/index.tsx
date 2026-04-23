"use client"

import { TaskDataTable } from "./data-table"

const mockData: Parameters<typeof TaskDataTable>[0]["data"] = [
  { id: "1", processInstId: 1, processName: "请假申请流程", taskName: "部门经理审批", assigneeName: "张三", status: 1, priority: 1, createdTime: "2026-04-23T10:35:00", dueDate: "2026-04-25" },
  { id: "2", processInstId: 2, processName: "费用报销流程", taskName: "财务复核", assigneeName: "李四", status: 1, priority: 2, createdTime: "2026-04-23T09:20:00", dueDate: "2026-04-26" },
  { id: "3", processInstId: 3, processName: "请假申请流程", taskName: "HR审批", assigneeName: "孙七", candidateName: "周八", status: 2, priority: 1, createdTime: "2026-04-22T16:25:00" },
  { id: "4", processInstId: 4, processName: "采购申请流程", taskName: "经理审批", assigneeName: "王五", status: 1, priority: 3, createdTime: "2026-04-21T14:00:00" },
]

export default function TaskListPage() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <TaskDataTable data={mockData} />
    </div>
  )
}
