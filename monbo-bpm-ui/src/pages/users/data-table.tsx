"use client"

import * as React from "react"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  IconChevronDown,
  IconChevronRight,
  IconCircleCheckFilled,
  IconDotsVertical,
  IconLayoutColumns,
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
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
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
import type { Department, SysUser, SysUserFormData, SysUserPage } from "@/lib/api"

// ============ 部门树组件 ============
interface DeptTreeProps {
  departments: Department[]
  selectedId: number | null
  onSelect: (id: number | null) => void
  className?: string
}

function sortTree(tree: Department[]): Department[] {
  const sorted = [...tree].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
  sorted.forEach((dept) => {
    if (dept.children && dept.children.length > 0) {
      dept.children = sortTree(dept.children)
    }
  })
  return sorted
}

function flattenDeptTree(tree: Department[], expandedIds: Set<number>, level = 0): { dept: Department; level: number; hasChildren: boolean }[] {
  const result: { dept: Department; level: number; hasChildren: boolean }[] = []
  for (const dept of tree) {
    const children = dept.children ?? []
    result.push({ dept, level, hasChildren: children.length > 0 })
    if (children.length > 0 && expandedIds.has(dept.id)) {
      result.push(...flattenDeptTree(children, expandedIds, level + 1))
    }
  }
  return result
}

function DeptTree({ departments, selectedId, onSelect, className }: DeptTreeProps) {
  const tree = React.useMemo(() => sortTree(departments), [departments])
  const [expandedIds, setExpandedIds] = React.useState<Set<number>>(() => {
    const ids = new Set<number>()
    for (const d of departments) ids.add(d.id)
    return ids
  })
  React.useEffect(() => {
    const ids = new Set<number>()
    for (const d of departments) ids.add(d.id)
    setExpandedIds(ids)
  }, [departments])

  const flatNodes = React.useMemo(() => flattenDeptTree(tree, expandedIds), [tree, expandedIds])

  const toggle = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className={`w-52 flex-shrink-0 border rounded-md overflow-y-auto ${className ?? ""}`}>
      {/* 全部用户选项 */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelect(null)}
        onKeyDown={(e) => e.key === "Enter" && onSelect(null)}
        className={`flex items-center gap-1.5 px-3 py-2 cursor-pointer text-sm border-b ${
          selectedId === null ? "bg-accent font-medium" : "hover:bg-accent"
        }`}
      >
        <span className="size-4" />
        全部用户
      </div>
      {flatNodes.map(({ dept, level, hasChildren }) => (
        <div key={dept.id} className="flex items-center">
          <button
            className="flex items-center justify-center w-6 h-6 flex-shrink-0"
            onClick={(e) => { e.stopPropagation(); toggle(dept.id) }}
          >
            {hasChildren ? (
              expandedIds.has(dept.id) ? (
                <IconChevronDown className="size-3.5 text-muted-foreground" />
              ) : (
                <IconChevronRight className="size-3.5 text-muted-foreground" />
              )
            ) : null}
          </button>
          <div
            role="button"
            tabIndex={0}
            onClick={() => onSelect(dept.id)}
            onKeyDown={(e) => e.key === "Enter" && onSelect(dept.id)}
            className={`flex-1 flex items-center gap-1.5 py-1.5 pr-2 cursor-pointer text-sm truncate ${
              selectedId === dept.id ? "bg-accent font-medium" : "hover:bg-accent"
            }`}
            style={{ paddingLeft: `${level * 16 + 4}px` }}
          >
            {dept.deptName}
          </div>
        </div>
      ))}
    </div>
  )
}

// ============ 用户表格组件 ============
interface UserTableProps {
  usersPage: SysUserPage
  pageNum: number
  onPageChange: (page: number) => void
  onEdit: (user: SysUser) => void
  onSetDeleteId: (id: number | null) => void
  loading: boolean
}

function formatTime(iso: string): string {
  if (!iso) return "-"
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function UserTable({ usersPage, pageNum, onPageChange, onEdit, onSetDeleteId, loading }: UserTableProps) {
  const { records, total, pages } = usersPage

  const columns: ColumnDef<SysUser>[] = React.useMemo(
    () => [
      {
        accessorKey: "username",
        header: "用户名",
        cell: ({ row }) => (
          <span className="truncate font-medium">{row.original.username}</span>
        ),
      },
      {
        accessorKey: "realName",
        header: "真实姓名",
        cell: ({ row }) => row.original.realName || "-",
      },
      {
        accessorKey: "email",
        header: "邮箱",
        cell: ({ row }) => row.original.email || "-",
      },
      {
        accessorKey: "phone",
        header: "手机",
        cell: ({ row }) => row.original.phone || "-",
      },
      {
        accessorKey: "roleNames",
        header: "角色",
        enableHiding: false,
        cell: ({ row }) =>
          row.original.roleNames && row.original.roleNames.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {row.original.roleNames.map((r, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {r}
                </Badge>
              ))}
            </div>
          ) : (
            "-"
          ),
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
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center justify-center w-8 h-8 rounded text-muted-foreground hover:bg-accent hover:text-foreground">
                <IconDotsVertical className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(row.original)}>
                  <IconPencil className="size-4 mr-2" />
                  编辑
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onSetDeleteId(row.original.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <IconTrash className="size-4 mr-2" />
                  删除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    [onEdit, onSetDeleteId]
  )

  // Dummy table for rendering column headers and empty states
  const table = useReactTable({
    data: records,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="flex flex-col gap-4 flex-1 min-w-0">
      {/* 表格 */}
      <div className="rounded-md border flex-1">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  加载中...
                </TableCell>
              </TableRow>
            ) : records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              records.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <span className="truncate font-medium">{user.username}</span>
                  </TableCell>
                  <TableCell>{user.realName || "-"}</TableCell>
                  <TableCell>{user.email || "-"}</TableCell>
                  <TableCell>{user.phone || "-"}</TableCell>
                  <TableCell>
                    {user.roleNames && user.roleNames.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {user.roleNames.map((r, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">{r}</Badge>
                        ))}
                      </div>
                    ) : "-"}
                  </TableCell>
                  <TableCell>
                    {user.status === 1 ? (
                      <Badge variant="outline" className="px-1.5 text-muted-foreground flex items-center">
                        <IconCircleCheckFilled className="fill-green-500 dark:fill-green-400" />
                        启用
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="px-1.5 text-muted-foreground flex items-center">
                        <IconXboxXFilled className="text-red-500 dark:text-red-400" />
                        停用
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{formatTime(user.createdTime)}</TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex items-center justify-center w-8 h-8 rounded text-muted-foreground hover:bg-accent hover:text-foreground">
                          <IconDotsVertical className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(user)}>
                            <IconPencil className="size-4 mr-2" />
                            编辑
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onSetDeleteId(user.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <IconTrash className="size-4 mr-2" />
                            删除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 分页 */}
      {pages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            共 {total} 条，第 {pageNum}/{pages} 页
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(1)}
              disabled={pageNum <= 1}
            >
              首页
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pageNum - 1)}
              disabled={pageNum <= 1}
            >
              上一页
            </Button>
            <span className="px-3 text-sm">
              {pageNum} / {pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pageNum + 1)}
              disabled={pageNum >= pages}
            >
              下一页
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pages)}
              disabled={pageNum >= pages}
            >
              末页
            </Button>
          </div>
        </div>
      )}
      {pages <= 1 && !loading && records.length > 0 && (
        <span className="text-sm text-muted-foreground">
          共 {total} 条
        </span>
      )}
    </div>
  )
}

// ============ 主组件 ============
interface DataTableProps {
  departments: Department[]
  roles: { id: number; roleName: string }[]
  selectedDeptId: number | null
  onDeptSelect: (id: number | null) => void
  usersPage: SysUserPage
  pageNum: number
  onPageChange: (page: number) => void
  searchText: string
  onSearchChange: (v: string) => void
  editId: number | null
  dialogOpen: boolean
  deleteId: number | null
  form: SysUserFormData
  onSetDialogOpen: (v: boolean) => void
  onSetDeleteId: (v: number | null) => void
  onFormChange: (f: SysUserFormData) => void
  onEdit: (user: SysUser) => void
  onDelete: (id: number) => void
  onSave: () => void
  saving: boolean
  loading: boolean
}

export function UserDataTable(props: DataTableProps) {
  const {
    departments,
    roles,
    selectedDeptId,
    onDeptSelect,
    usersPage,
    pageNum,
    onPageChange,
    searchText,
    onSearchChange,
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

  // 扁平化部门选项
  function flatDeptOptions(tree: Department[], level = 0): { id: number; label: string }[] {
    const result: { id: number; label: string }[] = []
    for (const dept of tree) {
      result.push({ id: dept.id, label: dept.deptName })
      if (dept.children && dept.children.length > 0) {
        result.push(...flatDeptOptions(dept.children, level + 1))
      }
    }
    return result
  }

  const deptOptions = React.useMemo(() => flatDeptOptions(departments), [departments])

  return (
    <div className="flex gap-4 flex-1 min-h-0">
      {/* 左侧部门树 */}
      <DeptTree
        departments={departments}
        selectedId={selectedDeptId}
        onSelect={onDeptSelect}
        className="h-full"
      />

      {/* 右侧：工具栏 + 表格 + 分页 */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        {/* 工具栏 */}
        <div className="flex items-center justify-between gap-2">
          <Input
            placeholder="搜索用户名..."
            value={searchText}
            onChange={(e) => { onSearchChange(e.target.value); onPageChange(1) }}
            className="w-64"
          />
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-input bg-background hover:bg-accent text-muted-foreground hover:text-foreground">
                <IconLayoutColumns className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {["username", "realName", "email", "phone", "roleNames", "status", "createdTime"].map((col) => (
                  <DropdownMenuCheckboxItem key={col} checked={true} onCheckedChange={() => {}}>
                    {col === "username" ? "用户名"
                      : col === "realName" ? "真实姓名"
                      : col === "email" ? "邮箱"
                      : col === "phone" ? "手机"
                      : col === "roleNames" ? "角色"
                      : col === "status" ? "状态"
                      : "创建时间"}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              onClick={() => {
                onFormChange({
                  username: "",
                  password: "",
                  realName: "",
                  email: "",
                  phone: "",
                  deptId: null,
                  roleIds: [],
                  status: 1,
                })
                onSetDialogOpen(true)
              }}
            >
              <IconPlus />
              新增用户
            </Button>
          </div>
        </div>

        {/* 表格 + 分页 */}
        <UserTable
          usersPage={usersPage}
          pageNum={pageNum}
          onPageChange={onPageChange}
          onEdit={onEdit}
          onSetDeleteId={onSetDeleteId}
          loading={loading}
        />
      </div>

      {/* 新增/编辑弹窗 */}
      <Dialog open={dialogOpen} onOpenChange={onSetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editId ? "编辑用户" : "新增用户"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="username">用户名 *</Label>
                <Input
                  id="username"
                  value={form.username}
                  onChange={(e) => onFormChange({ ...form, username: e.target.value })}
                  placeholder="admin"
                  disabled={!!editId}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password">{editId ? "新密码（不填则不修改）" : "密码 *"}</Label>
                <Input
                  id="password"
                  type="password"
                  value={form.password || ""}
                  onChange={(e) => onFormChange({ ...form, password: e.target.value })}
                  placeholder={editId ? "留空则保持原密码" : "请输入密码"}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="nickname">真实姓名</Label>
                <Input
                  id="nickname"
                  value={form.realName || ""}
                  onChange={(e) => onFormChange({ ...form, realName: e.target.value })}
                  placeholder="张三"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">邮箱</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email || ""}
                  onChange={(e) => onFormChange({ ...form, email: e.target.value })}
                  placeholder="admin@example.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="phone">手机</Label>
                <Input
                  id="phone"
                  value={form.phone || ""}
                  onChange={(e) => onFormChange({ ...form, phone: e.target.value })}
                  placeholder="138xxxx8888 或 021-xxxxxxx"
                />
                {form.phone && !/^(1[3-9]\d{9}|0\d{2,3}-?\d{7,8})$/.test(form.phone) && (
                  <p className="text-destructive text-xs">格式有误，请输入有效手机号或固定电话</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="deptId">部门</Label>
                <Select
                  value={form.deptId == null ? "" : String(form.deptId)}
                  onValueChange={(v) => onFormChange({ ...form, deptId: v === "" ? null : Number(v) })}
                >
                  <SelectTrigger id="deptId">
                    <SelectValue>
                      {form.deptId == null
                        ? "请选择部门"
                        : (deptOptions.find((o) => o.id === form.deptId)?.label ?? "请选择部门")}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">无</SelectItem>
                    {deptOptions.map((opt) => (
                      <SelectItem key={opt.id} value={String(opt.id)}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="roles">角色</Label>
              <Select
                value={form.roleIds && form.roleIds.length > 0 ? String(form.roleIds[0]) : ""}
                onValueChange={(v) => onFormChange({ ...form, roleIds: v === "" ? [] : [Number(v)] })}
              >
                <SelectTrigger id="roles">
                  <SelectValue>
                    {form.roleIds && form.roleIds.length > 0
                        ? (roles.find((r) => r.id === (form.roleIds ?? [])[0])?.roleName ?? "请选择角色")
                      : "请选择角色（单选）"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={String(role.id)}>
                      {role.roleName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="status">状态</Label>
              <Select
                value={String(form.status ?? 1)}
                onValueChange={(v) => onFormChange({ ...form, status: Number(v) })}
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
                if (!form.username.trim()) return
                if (!editId && !form.password?.trim()) return
                if (form.phone && !/^(1[3-9]\d{9}|0\d{2,3}-?\d{7,8})$/.test(form.phone)) return
                onSave()
              }}
              disabled={saving}
            >
              {saving ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认 */}
      <Dialog open={deleteId !== null} onOpenChange={(v) => !v && onSetDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
          </DialogHeader>
          <p className="py-4 text-muted-foreground">
            删除后无法恢复，确定要删除该用户吗？
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
