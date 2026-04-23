"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import {
  IconArrowUp,
  IconArrowDown,
  IconCircleCheckFilled,
  IconDotsVertical,
  IconEye,
  IconFileDescription,
  IconPencil,
  IconPlus,
  IconTrash,
  IconXboxXFilled,
} from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { ProcessDefRespDTO } from "@/lib/types"

function formatTime(iso?: string): string {
  if (!iso) return "-"
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

interface ProcessDefCardGridProps {
  list: ProcessDefRespDTO[]
  loading: boolean
  searchText: string
  onSearchChange: (v: string) => void
  statusFilter: number | null
  onStatusFilterChange: (v: number | null) => void
  createOpen: boolean
  createForm: { processName: string; category: string }
  onCreateFormChange: (f: { processName: string; category: string }) => void
  onCreateOpenChange: (v: boolean) => void
  creating: boolean
  onCreate: () => void
  onActivate: (id: number) => void
  onSuspend: (id: number) => void
  onDelete: (id: number) => void
  onDesignerSave: (id: number, bpmnXml: string, svgXml?: string) => void
  onRefresh: () => void
}

export function ProcessDefCardGrid(props: ProcessDefCardGridProps) {
  const {
    list,
    loading,
    searchText,
    onSearchChange,
    statusFilter,
    onStatusFilterChange,
    createOpen,
    createForm,
    onCreateFormChange,
    onCreateOpenChange,
    creating,
    onCreate,
    onActivate,
    onSuspend,
  } = props

  const navigate = useNavigate()
  const [deleteId, setDeleteId] = React.useState<number | null>(null)
  const [deleteLoading, setDeleteLoading] = React.useState(false)

  const handleDeleteConfirm = async () => {
    if (deleteId === null) return
    setDeleteLoading(true)
    try {
      await props.onDelete(deleteId)
      setDeleteId(null)
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <>
      {/* 工具栏 */}
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={() => onCreateOpenChange(true)}>
          <IconPlus className="size-4 mr-1" />
          新建流程
        </Button>
        <Input
          placeholder="搜索流程名称或Key..."
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-52"
        />
        <Select
          value={statusFilter === null ? "all" : String(statusFilter)}
          onValueChange={(v) => onStatusFilterChange(v === "all" ? null : Number(v))}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="1">激活</SelectItem>
            <SelectItem value="2">挂起</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={props.onRefresh}>
          刷新
        </Button>
      </div>

      {/* 卡片网格 */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg border bg-muted/30 h-44" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <IconFileDescription className="size-12 text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">暂无流程定义</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => onCreateOpenChange(true)}
          >
            <IconPlus className="size-4 mr-1" />
            新建第一个流程
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((p) => (
            <div
              key={p.id}
              className="group relative flex flex-col rounded-lg border bg-card p-4 text-card-foreground shadow-sm transition-shadow hover:shadow-md"
            >
              {/* 卡片头部 */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex-1 min-w-0">
                  <p className="truncate font-semibold text-base">{p.processName}</p>
                  <p className="truncate text-xs text-muted-foreground mt-0.5">
                    {p.processKey}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Badge
                    variant={p.status === 1 ? "default" : "secondary"}
                    className="text-xs gap-1"
                  >
                    {p.status === 1 ? (
                      <IconCircleCheckFilled className="size-3 fill-green-500 dark:fill-green-400" />
                    ) : (
                      <IconXboxXFilled className="size-3 text-muted-foreground" />
                    )}
                    {p.status === 1 ? "激活" : "挂起"}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="inline-flex items-center justify-center w-7 h-7 rounded text-muted-foreground hover:bg-accent hover:text-foreground">
                      <IconDotsVertical className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/process-defs/${p.id}/design`)}>
                        <IconPencil className="size-4 mr-2" />
                        编辑流程
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(`/process-insts?processDefId=${p.id}`)}>
                        <IconEye className="size-4 mr-2" />
                        查看实例
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {p.status === 1 ? (
                        <DropdownMenuItem onClick={() => onSuspend(p.id)}>
                          <IconArrowDown className="size-4 mr-2" />
                          挂起
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => onActivate(p.id)}>
                          <IconArrowUp className="size-4 mr-2" />
                          激活
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setDeleteId(p.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <IconTrash className="size-4 mr-2" />
                        删除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* 描述 */}
              {p.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">
                  {p.description}
                </p>
              )}

              {/* 底部信息 */}
              <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
                <span>v{p.version}</span>
                <span>{formatTime(p.createdTime)}</span>
              </div>

              {/* 分类标签 */}
              {p.category && (
                <div className="mt-2">
                  <Badge variant="outline" className="text-xs">
                    {p.category}
                  </Badge>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 新建弹窗 */}
      <Dialog open={createOpen} onOpenChange={onCreateOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新建流程</DialogTitle>
            <DialogDescription>创建一个新的流程定义</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>
                流程名称 <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="请输入流程名称"
                value={createForm.processName}
                onChange={(e) =>
                  onCreateFormChange({ ...createForm, processName: e.target.value })
                }
                onKeyDown={(e) => e.key === "Enter" && onCreate()}
              />
            </div>
            <div className="space-y-2">
              <Label>分类（可选）</Label>
              <Input
                placeholder="如：审批类、报销类"
                value={createForm.category}
                onChange={(e) =>
                  onCreateFormChange({ ...createForm, category: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onCreateOpenChange(false)}>
              取消
            </Button>
            <Button onClick={onCreate} disabled={creating}>
              {creating ? "创建中..." : "创建"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认弹窗 */}
      <Dialog open={deleteId !== null} onOpenChange={(v) => !v && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除这个流程定义吗？此操作不可恢复。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteLoading}
            >
              {deleteLoading ? "删除中..." : "删除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
