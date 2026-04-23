"use client"

import { ProcessInstDataTable } from "./data-table"

const mockData: Parameters<typeof ProcessInstDataTable>[0]["data"] = [
  { id: 1, processDefId: 1, processName: "请假申请流程", businessKey: "LEAVE-2026-001", starterName: "张三", status: 1, createdTime: "2026-04-23T10:30:00" },
  { id: 2, processDefId: 2, processName: "费用报销流程", businessKey: "EXP-2026-001", starterName: "李四", status: 2, createdTime: "2026-04-23T09:15:00" },
  { id: 3, processDefId: 1, processName: "请假申请流程", businessKey: "LEAVE-2026-002", starterName: "王五", status: 1, createdTime: "2026-04-22T16:20:00" },
]

export default function ProcessInstListPage() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <ProcessInstDataTable data={mockData} />
    </div>
  )
}
