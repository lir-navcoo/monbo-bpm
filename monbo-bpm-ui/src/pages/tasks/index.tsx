"use client"

import * as React from "react"
import { TaskDataTable } from "./data-table"
import { taskApi } from "@/lib/api/task"
import type { Task } from "./data-table"
import type { TaskRespDTO } from "@/lib/types"

function mapTaskRespToTask(dto: TaskRespDTO): Task {
  return {
    id: dto.camundaTaskId,
    processInstId: 0,
    processName: dto.processDefName || "",
    taskName: dto.taskName,
    assigneeName: dto.assignee || "",
    status: dto.status === "pending" ? 1 : 2,
    priority: dto.priority,
    createdTime: dto.createdTime || "",
    dueDate: dto.dueDate,
  }
}

export default function TaskListPage() {
  const [data, setData] = React.useState<Task[]>([])
  const [loading, setLoading] = React.useState(true)

  const fetchData = React.useCallback(async () => {
    setLoading(true)
    try {
      const [myTasks, historyTasks] = await Promise.all([
        taskApi.listMy().catch(() => []),
        taskApi.listHistory().catch(() => []),
      ])

      const allTasks = [...myTasks, ...historyTasks].map(mapTaskRespToTask)
      setData(allTasks)
    } catch (err) {
      console.error("Failed to fetch tasks:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <div className="flex flex-1 flex-col gap-4">
      <TaskDataTable
        data={data}
        loading={loading}
        onRefresh={fetchData}
      />
    </div>
  )
}
