"use client"

import * as React from "react"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  IconCircleCheckFilled,
  IconDotsVertical,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Role, RoleFormData } from "@/lib/api"

interface DataTableProps {
  data: Role[]
  editId: number | null
  dialogOpen: boolean
  deleteId: number | null
  form: RoleFormData
  onSetDialogOpen: (v: boolean) => void
  onSetDeleteId: (v: number | null) => void
  onFormChange: (f: RoleFormData) => void
  onEdit: (role: Role) => void
  onDelete: (id: number) => void
  onSave: () => void
  saving: boolean
  loading: boolean
}

function formatTime(time: string) {
  if (!time) return "-"
  return time.replace("T", " ").slice(0, 19)
}

export function RoleDataTable(props: DataTableProps) {
  const {
    data,
    editId,
    dialogOpen,
    deleteId,
    form,
    onSetDialogOpen,
    onSetDeleteId,
    onFormChange,
    onEdit,
    onDelete,
    onSave,
    saving,
    loading,
  } = props

  const [sorting] = React.useState([])
  const [columnVisibility] = React.useState({})

  const columns: ColumnDef<Role>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <span className="text-muted-foreground font-mono text-xs">
          {row.original.id}
        </span>
      ),
    },
    {
      accessorKey: "roleCode",
      header: "角色编码",
      cell: ({ row }) => (
        <code className="text-sm font-mono">{row.original.roleCode}</code>
      ),
    },
    {
      accessorKey: "roleName",
      header: "角色名称",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.roleName}</span>
      ),
    },
    {
      accessorKey: "description",
      header: "描述",
      cell: ({ row }) => row.original.description || "-",
    },
    {
      accessorKey: "status",
      header: "状态",
      cell: ({ row }) => {
        const status = row.original.status === 1 ? "启用" : "停用"
        return (
          <Badge variant="outline" className="px-1.5 text-muted-foreground flex items-center">
            {row.original.status === 1 ? (
              <IconCircleCheckFilled className="fill-green-500 dark:fill-green-400" />
            ) : (
              <IconXboxXFilled className="text-red-500 dark:text-red-400" />
            )}
            {status}
          </Badge>
        )
      },
    },
    {
      accessorKey: "createdTime",
      header: "创建时间",
      cell: ({ row }) => formatTime(row.original.createdTime),
    },
    {
      id: "actions",
      header: () => <div className="text-right">操作</div>,
      cell: ({ row }) => (
        <div className="flex items-center justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center justify-center w-8 h-8 rounded text-muted-foreground hover:bg-accent hover:text-foreground">
              <IconDotsVertical className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(row.original)}>
                <IconPencil className="size-4 mr-2" />
                编辑
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onSetDeleteId(row.original.id)}
                className="text-destructive"
              >
                <IconTrash className="size-4 mr-2" />
                删除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ]

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnVisibility },
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
  })

  return (
    <div className="flex flex-col gap-4">
      {/* 工具栏 */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground" />
        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              onFormChange({ roleName: "", roleCode: "", description: "", status: 1 })
              onSetDialogOpen(true)
            }}
          >
            <IconPlus className="size-4 mr-1" />
            新建角色
          </Button>
        </div>
      </div>

      {/* 表格 */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  加载中...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 新建/编辑弹窗 */}
      <Dialog open={dialogOpen} onOpenChange={onSetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editId ? "编辑角色" : "新建角色"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="roleName">角色名称</Label>
                <Input
                  id="roleName"
                  value={form.roleName ?? ""}
                  onChange={(e) =>
                    onFormChange({ ...form, roleName: e.target.value })
                  }
                  placeholder="系统管理员"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="roleCode">角色编码</Label>
                <Input
                  id="roleCode"
                  value={form.roleCode ?? ""}
                  onChange={(e) =>
                    onFormChange({ ...form, roleCode: e.target.value })
                  }
                  placeholder="ADMIN"
                  disabled={!!editId}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="description">描述</Label>
              <Input
                id="description"
                value={form.description ?? ""}
                onChange={(e) =>
                  onFormChange({ ...form, description: e.target.value })
                }
                placeholder="描述角色权限"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="status">状态</Label>
              <Select
                value={String(form.status ?? 1)}
                onValueChange={(v) =>
                  onFormChange({ ...form, status: Number(v) })
                }
              >
                <SelectTrigger id="status">
                  <SelectValue>{form.status === 0 ? "停用" : "启用"}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">启用</SelectItem>
                  <SelectItem value="0">停用</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onSetDialogOpen(false)}>
              取消
            </Button>
            <Button
              onClick={() => {
                if (!form.roleName?.trim()) return
                if (!form.roleCode?.trim()) return
                onSave()
              }}
              disabled={saving || !form.roleName?.trim() || !form.roleCode?.trim()}
            >
              {saving ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认弹窗 */}
      <Dialog open={deleteId !== null} onOpenChange={(v) => !v && onSetDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            确定要删除该角色吗？此操作无法撤销。
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => onSetDeleteId(null)}>
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteId !== null && onDelete(deleteId)}
            >
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
