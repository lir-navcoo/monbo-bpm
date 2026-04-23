"use client"

import * as React from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
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
import type { Department, DepartmentFormData, SysUser } from "@/lib/api"
import { fetchAllUsers } from "@/lib/api"

interface DataTableProps {
  data: Department[]
  leaderUsers: { id: number; username: string; realName: string }[]
  editId: number | null
  dialogOpen: boolean
  deleteId: number | null
  form: DepartmentFormData
  onSetDialogOpen: (v: boolean) => void
  onSetDeleteId: (v: number | null) => void
  onFormChange: (f: DepartmentFormData) => void
  onEdit: (dept: Department) => void
  onDelete: (id: number) => void
  onSave: () => void
  saving: boolean
  loading: boolean
}

// API已返回树形数据，只需排序
function sortTree(tree: Department[]): Department[] {
  const sorted = [...tree].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
  sorted.forEach((dept) => {
    if (dept.children && dept.children.length > 0) {
      dept.children = sortTree(dept.children)
    }
  })
  return sorted
}

// 扁平化树结构，同时记录层级；只输出当前展开的节点
interface FlatNode {
  dept: Department
  level: number
  hasChildren: boolean
}

function flattenTree(tree: Department[], expandedIds: Set<number>, level = 0): FlatNode[] {
  const result: FlatNode[] = []
  for (const dept of tree) {
    const children = dept.children ?? []
    result.push({
      dept,
      level,
      hasChildren: children.length > 0,
    })
    // 只有当前节点是展开状态，才继续扁平化子节点
    if (children.length > 0 && expandedIds.has(dept.id)) {
      result.push(...flattenTree(children, expandedIds, level + 1))
    }
  }
  return result
}

// 扁平化部门树，用于父部门选择器选项（排除自身）
function flatDeptOptions(tree: Department[], level = 0, excludeId?: number): { id: number; label: string }[] {
  const result: { id: number; label: string }[] = []
  for (const dept of tree) {
    if (excludeId !== undefined && dept.id === excludeId) continue
    result.push({ id: dept.id, label: "　".repeat(level) + dept.deptName })
    if (dept.children && dept.children.length > 0) {
      result.push(...flatDeptOptions(dept.children, level + 1, excludeId))
    }
  }
  return result
}

// 生成唯一行ID
function getRowId(node: FlatNode): string {
  return `dept-${node.dept.id}`
}

export function DepartmentDataTable(props: DataTableProps) {
  const {
    data,
    leaderUsers,
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

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [globalFilter, setGlobalFilter] = React.useState("")
  // 计算初始展开的根部门ID（这样一级子部门默认展示）
  const [expandedIds, setExpandedIds] = React.useState<Set<number>>(() => new Set())
  const [leaderDialogOpen, setLeaderDialogOpen] = React.useState(false)
  const [leaderSearch, setLeaderSearch] = React.useState("")
  const [dialogUsers, setDialogUsers] = React.useState<SysUser[]>([])
  const [loadingDialogUsers, setLoadingDialogUsers] = React.useState(false)
  // 保存选中用户的完整对象，选择后直接用 realName 显示，不依赖父组件用户数据
  const [selectedLeaderUser, setSelectedLeaderUser] = React.useState<SysUser | null>(null)

  // 搜索时重新请求（带搜索关键字，10条）
  React.useEffect(() => {
    if (!leaderDialogOpen) return
    const timer = setTimeout(() => {
      setLoadingDialogUsers(true)
      fetchAllUsers({ pageNum: 1, pageSize: 10, username: leaderSearch || undefined })
        .then((data) => setDialogUsers(data || []))
        .catch(() => {})
        .finally(() => setLoadingDialogUsers(false))
    }, 300)
    return () => clearTimeout(timer)
  }, [leaderSearch, leaderDialogOpen])

  // 打开弹窗时，如果已有 leader，从 dialogUsers 中找对应的完整用户对象
  React.useEffect(() => {
    if (!leaderDialogOpen) return
    if (!form.leader) {
      setSelectedLeaderUser(null)
      return
    }
    // 从弹窗内加载的当前页用户中查找
    const found = dialogUsers.find((u) => u.username === form.leader)
    setSelectedLeaderUser(found || null)
  }, [leaderDialogOpen, dialogUsers])

  // data变化时同步：所有根部门默认展开
  React.useEffect(() => {
    const ids = new Set<number>()
    for (const root of data) {
      ids.add(root.id)
    }
    setExpandedIds(ids)
  }, [data])

  // 树 & 扁平化
  const tree = React.useMemo(() => sortTree(data), [data])

  // 全局过滤后的树（保留结构，只过滤节点）
  const filterTree = React.useCallback(
    (list: Department[], keyword: string): Department[] => {
      if (!keyword.trim()) return list
      const lower = keyword.toLowerCase()
      const result: Department[] = []
      for (const dept of list) {
        const matched =
          dept.deptName.toLowerCase().includes(lower) ||
          dept.deptCode.toLowerCase().includes(lower)
        const filteredChildren = filterTree(dept.children || [], keyword)
        if (matched || filteredChildren.length > 0) {
          result.push({ ...dept, children: filteredChildren })
        }
      }
      return result
    },
    []
  )

  const filteredTree = React.useMemo(
    () => filterTree(tree, globalFilter),
    [tree, globalFilter, filterTree]
  )

  const flatNodes = React.useMemo(
    () => flattenTree(filteredTree, expandedIds),
    [filteredTree, expandedIds]
  )

  // 切换展开/收起
  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const columns: ColumnDef<FlatNode>[] = [
    {
      id: "expand",
      header: () => null,
      cell: ({ row }) => {
        const node = row.original
        if (!node.hasChildren) return <span className="block w-6" />
        return (
          <button
            className="flex items-center justify-center w-6 h-6 rounded text-foreground hover:bg-accent"
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              toggleExpand(node.dept.id)
            }}
          >
            {expandedIds.has(node.dept.id) ? (
              <IconChevronDown className="size-4" />
            ) : (
              <IconChevronRight className="size-4" />
            )}
          </button>
        )
      },
      enableHiding: false, // 不出现在列设置中
    },
    {
      accessorKey: "deptName",
      header: "部门名称",
      enableHiding: false,
      cell: ({ row }) => {
        const { level, dept } = row.original
        return (
          <span
            className="font-medium truncate block"
            style={{ paddingLeft: `${level * 20}px` }}
          >
            {dept.deptName}
          </span>
        )
      },
    },
    {
      accessorKey: "deptCode",
      header: "部门编码",
      cell: ({ row }) => (
        <code className="text-sm font-mono">{row.original.dept.deptCode}</code>
      ),
    },
    {
      accessorKey: "leader",
      header: "负责人",
      cell: ({ row }) => {
        const username = row.original.dept.leader
        const user = leaderUsers.find((u) => u.username === username)
        return user ? `${user.realName} (${username})` : username || "-"
      },
    },
    {
      accessorKey: "phone",
      header: "联系电话",
      cell: ({ row }) => row.original.dept.phone || "-",
    },
    {
      accessorKey: "email",
      header: "邮箱",
      cell: ({ row }) => row.original.dept.email || "-",
    },
    {
      accessorKey: "sortOrder",
      header: "排序",
      cell: ({ row }) => row.original.dept.sortOrder,
    },
    {
      accessorKey: "status",
      header: "状态",
      cell: ({ row }) => {
        const status = row.original.dept.status === 1 ? "启用" : "停用"
        return (
          <Badge variant="outline" className="px-1.5 text-muted-foreground flex items-center">
            {row.original.dept.status === 1 ? (
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
      id: "actions",
      header: () => <div className="text-right">操作</div>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center justify-center w-8 h-8 rounded text-muted-foreground hover:bg-accent hover:text-foreground">
              <IconDotsVertical className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(row.original.dept)}>
                <IconPencil className="size-4 mr-2" />
                编辑
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onSetDeleteId(row.original.dept.id)}
                className="text-destructive focus:text-destructive"
              >
                <IconTrash className="size-4 mr-2" />
                删除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      enableHiding: false,
    },
  ]

  const table = useReactTable({
    data: flatNodes,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => getRowId(row),
  })

  return (
    <div className="flex flex-col gap-4">
      {/* 工具栏 */}
      <div className="flex items-center justify-between gap-2">
        <Input
          placeholder="搜索部门..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="w-64"
        />
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-input bg-background hover:bg-accent text-muted-foreground hover:text-foreground">
              <IconLayoutColumns className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {String(column.columnDef.header)}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            onClick={() => {
              onFormChange({
                deptName: "",
                deptCode: "",
                parentId: null,
                leader: "",
                phone: "",
                email: "",
                sortOrder: 0,
                status: 1,
              })
              onSetDialogOpen(true)
            }}
          >
            <IconPlus/>
            新增
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
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  加载中...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  暂无数据
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* 新增/编辑弹窗 */}
      <Dialog open={dialogOpen} onOpenChange={onSetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editId ? "编辑部门" : "新增部门"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="deptName">部门名称 *</Label>
                <Input
                  id="deptName"
                  value={form.deptName}
                  onChange={(e) =>
                    onFormChange({ ...form, deptName: e.target.value })
                  }
                  placeholder="研发部"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="deptCode">部门编码 *</Label>
                <Input
                  id="deptCode"
                  value={form.deptCode}
                  onChange={(e) =>
                    onFormChange({ ...form, deptCode: e.target.value })
                  }
                  placeholder="DEPT001"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="parentId">上级部门</Label>
              <Select
                value={form.parentId === null || form.parentId === undefined ? "" : String(form.parentId)}
                onValueChange={(v) =>
                  onFormChange({ ...form, parentId: v === "" ? null : Number(v) })
                }
              >
                <SelectTrigger id="parentId">
                  <SelectValue>
                    {form.parentId === null || form.parentId === undefined
                      ? "无（顶级部门）"
                      : (() => {
                          const findLabel = (list: Department[], id: number): string => {
                            for (const d of list) {
                              if (d.id === id) return d.deptName
                              if (d.children?.length) {
                                const found = findLabel(d.children, id)
                                if (found) return found
                              }
                            }
                            return ""
                          }
                          return findLabel(tree, form.parentId) || "无（顶级部门）"
                        })()}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">无（顶级部门）</SelectItem>
                  {flatDeptOptions(tree, 0, editId ?? undefined).map((opt) => (
                    <SelectItem key={opt.id} value={String(opt.id)}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="leader">负责人</Label>
                <Input
                  id="leader"
                  readOnly
                  value={
                    selectedLeaderUser
                      ? `${selectedLeaderUser.realName} (${form.leader})`
                      : form.leader
                        ? form.leader
                        : ""
                  }
                  onClick={() => setLeaderDialogOpen(true)}
                  placeholder="点击选择负责人"
                  className="cursor-pointer"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="phone">联系电话</Label>
                <Input
                  id="phone"
                  value={form.phone || ""}
                  onChange={(e) =>
                    onFormChange({ ...form, phone: e.target.value })
                  }
                  placeholder="138xxxx8888 或 021-xxxxxxx"
                />
                {form.phone && !/^(1[3-9]\d{9}|0\d{2,3}-?\d{7,8})$/.test(form.phone) && (
                  <p className="text-destructive text-xs">格式有误，请输入有效手机号或固定电话</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="email">邮箱</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email || ""}
                  onChange={(e) =>
                    onFormChange({ ...form, email: e.target.value })
                  }
                  placeholder="dept@example.com"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="sortOrder">排序</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={form.sortOrder ?? 0}
                  onChange={(e) =>
                    onFormChange({
                      ...form,
                      sortOrder: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
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
                  <SelectValue>{form.status === 0 ? '停用' : '启用'}</SelectValue>
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
                if (!form.deptName.trim() || !form.deptCode.trim()) return
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

      {/* 负责人选择弹窗 */}
      <Dialog open={leaderDialogOpen} onOpenChange={setLeaderDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>选择负责人</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <Input
              placeholder="搜索用户名或姓名..."
              value={leaderSearch}
              onChange={(e) => setLeaderSearch(e.target.value)}
              autoFocus
            />
            <div className="max-h-72 overflow-y-auto rounded-md border">
              <div
                role="button"
                tabIndex={0}
                onClick={() => {
                  onFormChange({ ...form, leader: undefined })
                  setSelectedLeaderUser(null)
                  setLeaderDialogOpen(false)
                  setLeaderSearch("")
                }}
                onKeyDown={(e) => e.key === "Enter" && (() => {
                  onFormChange({ ...form, leader: undefined })
                  setSelectedLeaderUser(null)
                  setLeaderDialogOpen(false)
                  setLeaderSearch("")
                })()}
                className={`flex items-center px-3 py-2 cursor-pointer text-sm hover:bg-accent ${
                  !form.leader ? "bg-accent font-medium" : ""
                }`}
              >
                不指定负责人
              </div>
              {loadingDialogUsers ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  加载中...
                </div>
              ) : dialogUsers
                  .filter(
                    (u) =>
                      !leaderSearch ||
                      u.username.toLowerCase().includes(leaderSearch.toLowerCase()) ||
                      u.realName.toLowerCase().includes(leaderSearch.toLowerCase())
                  )
                  .length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  未找到匹配的用户
                </div>
              ) : (
                dialogUsers
                  .filter(
                    (u) =>
                      !leaderSearch ||
                      u.username.toLowerCase().includes(leaderSearch.toLowerCase()) ||
                      u.realName.toLowerCase().includes(leaderSearch.toLowerCase())
                  )
                  .map((u) => (
                    <div
                      key={u.username}
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        onFormChange({ ...form, leader: u.username })
                        setSelectedLeaderUser(u)
                        setLeaderDialogOpen(false)
                        setLeaderSearch("")
                      }}
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        (() => {
                          onFormChange({ ...form, leader: u.username })
                          setSelectedLeaderUser(u)
                          setLeaderDialogOpen(false)
                          setLeaderSearch("")
                        })()
                      }
                      className={`flex items-center px-3 py-2 cursor-pointer text-sm hover:bg-accent ${
                        form.leader === u.username ? "bg-accent font-medium" : ""
                      }`}
                    >
                      <span className="flex-1">{u.realName}</span>
                      <span className="text-muted-foreground text-xs">{u.username}</span>
                    </div>
                  ))
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLeaderDialogOpen(false)}>
              取消
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认 */}
      <Dialog
        open={deleteId !== null}
        onOpenChange={(v) => !v && onSetDeleteId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
          </DialogHeader>
          <p className="py-4 text-muted-foreground">
            确定要删除该部门吗？此操作不可恢复。
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => onSetDeleteId(null)}>
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteId !== null) {
                  onDelete(deleteId)
                  onSetDeleteId(null)
                }
              }}
            >
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
