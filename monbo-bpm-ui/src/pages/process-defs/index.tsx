"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { processDefApi } from "@/lib/api/process-def"
import type { ProcessDefRespDTO } from "@/lib/types"
import { ProcessDefCardGrid } from "./data-table"

export default function ProcessDefListPage() {
  const [list, setList] = useState<ProcessDefRespDTO[]>([])
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState("")
  const [statusFilter, setStatusFilter] = useState<number | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState({ processName: "", category: "" })
  const [creating, setCreating] = useState(false)

  const loadList = useCallback(async () => {
    setLoading(true)
    try {
      const data = await processDefApi.list()
      setList(data ?? [])
    } catch {
      toast.error("加载流程定义列表失败")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadList()
  }, [loadList])

  // 过滤
  const filtered = list.filter((p) => {
    const matchSearch =
      !searchText ||
      p.processName.toLowerCase().includes(searchText.toLowerCase()) ||
      p.processKey.toLowerCase().includes(searchText.toLowerCase())
    const matchStatus = statusFilter === null || p.status === statusFilter
    return matchSearch && matchStatus
  })

  const handleCreate = async () => {
    if (!createForm.processName.trim()) {
      toast.error("请输入流程名称")
      return
    }
    setCreating(true)
    try {
      // 自动生成 key
      const key =
        createForm.processName
          .replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, "")
          .slice(0, 20)
          .toLowerCase() +
        "_" +
        Date.now()
      await processDefApi.create({
        processKey: key,
        processName: createForm.processName,
        category: createForm.category || undefined,
      })
      toast.success("创建成功")
      setCreateOpen(false)
      setCreateForm({ processName: "", category: "" })
      loadList()
    } catch (err: any) {
      toast.error(err.message || "创建失败")
    } finally {
      setCreating(false)
    }
  }

  const handleActivate = async (id: number) => {
    try {
      await processDefApi.activate(id)
      toast.success("激活成功")
      loadList()
    } catch (err: any) {
      toast.error(err.message || "激活失败")
    }
  }

  const handleSuspend = async (id: number) => {
    try {
      await processDefApi.suspend(id)
      toast.success("挂起成功")
      loadList()
    } catch (err: any) {
      toast.error(err.message || "挂起失败")
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await processDefApi.remove(id)
      toast.success("删除成功")
      loadList()
    } catch (err: any) {
      toast.error(err.message || "删除失败")
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <ProcessDefCardGrid
        list={filtered}
        loading={loading}
        searchText={searchText}
        onSearchChange={setSearchText}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        createOpen={createOpen}
        createForm={createForm}
        onCreateFormChange={setCreateForm}
        onCreateOpenChange={setCreateOpen}
        creating={creating}
        onCreate={handleCreate}
        onActivate={handleActivate}
        onSuspend={handleSuspend}
        onDelete={handleDelete}
        onDesignerSave={() => {}}
        onRefresh={loadList}
      />
    </div>
  )
}
