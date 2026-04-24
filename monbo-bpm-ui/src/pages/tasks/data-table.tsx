"use client"

import * as React from "react"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  IconArrowRight,
  IconCheck,
  IconCircleCheckFilled,
  IconDotsVertical,
  IconEye,
  IconRefresh,
} from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
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

export interface Task {
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

interface DataTableProps {
  data: Task[]
  loading?: boolean
  onRefresh?: () => void
}

const priorityMap: Record<number, { label: string; color: string }> = {
  1: { label: "高", color: "bg-red-500 text-white" },
  2: { label: "中", color: "bg-yellow-500 text-black" },
  3: { label: "低", color: "bg-green-500 text-white" },
}

const statusMap: Record<number, { label: string }> = {
  1: { label: "待处理" },
  2: { label: "已完成" },
}

function formatTime(time?: string) {
  if (!time) return "-"
  return time.replace("T", " ").slice(0, 16)
}

export function TaskDataTable(props: DataTableProps) {
  const { data, loading, onRefresh } = props

  const [searchText, setSearchText] = React.useState("")
  const [internalStatusFilter, setInternalStatusFilter] = React.useState<number>(0)
  const [filteredData, setFilteredData] = React.useState<Task[]>(data)

  React.useEffect(() => {
    const lower = searchText.toLowerCase()
    setFilteredData(
      data.filter((item) => {
        const matchSearch =
          !searchText ||
          item.processName.toLowerCase().includes(lower) ||
          item.taskName.toLowerCase().includes(lower) ||
          item.assigneeName.toLowerCase().includes(lower)
        const matchStatus = internalStatusFilter === 0 || item.status === internalStatusFilter
        return matchSearch && matchStatus
      })
    )
  }, [data, searchText, internalStatusFilter])

  const [sorting] = React.useState([])
  const [columnVisibility] = React.useState({})

  const handleStatusChange = (v: string | null) => {
    setInternalStatusFilter(v === null || v === "全部状态" ? 0 : v === "待处理" ? 1 : 2)
  }

  const columns: ColumnDef<Task>[] = [
    {
      accessorKey: "priority",
      header: "优先级",
      cell: ({ row }) => {
        const p = priorityMap[row.original.priority]
        return (
          <Badge className={`${p?.color}`}>
            {p?.label}
          </Badge>
        )
      },
    },
    {
      accessorKey: "taskName",
      header: "任务名称",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.taskName}</span>
          <span className="text-xs text-muted-foreground">{row.original.processName}</span>
        </div>
      ),
    },
    {
      accessorKey: "assigneeName",
      header: "办理人",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span>{row.original.assigneeName || "未分配"}</span>
          {row.original.candidateName && (
            <span className="text-xs text-muted-foreground">候选：{row.original.candidateName}</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "状态",
      cell: ({ row }) => (
        <Badge variant="outline" className="px-1.5 text-muted-foreground flex items-center gap-1">
          {row.original.status === 1 ? (
            <span className="size-1.5 rounded-full bg-blue-500" />
          ) : (
            <IconCircleCheckFilled className="fill-green-500 dark:fill-green-400 size-3" />
          )}
          {statusMap[row.original.status]?.label ?? "未知"}
        </Badge>
      ),
    },
    {
      accessorKey: "dueDate",
      header: "截止日期",
      cell: ({ row }) => {
        if (!row.original.dueDate) return <span className="text-muted-foreground">-</span>
        const isOverdue = row.original.status === 1
        return (
          <span className={isOverdue ? "text-orange-500" : "text-muted-foreground"}>
            {row.original.dueDate}
          </span>
        )
      },
    },
    {
      accessorKey: "createdTime",
      header: "创建时间",
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">{formatTime(row.original.createdTime)}</span>
      ),
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
              <DropdownMenuItem>
                <IconEye className="size-4 mr-2" />
                查看详情
              </DropdownMenuItem>
              {row.original.status === 1 && (
                <>
                  <DropdownMenuItem>
                    <IconCheck className="size-4 mr-2" />
                    办理任务
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <IconArrowRight className="size-4 mr-2" />
                    转交
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ]

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, columnVisibility },
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
  })

  return (
    <div className="flex flex-col gap-4">
      {/* 工具栏 */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Input
            placeholder="搜索流程名称、任务名称..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-64"
          />
          <Select value={internalStatusFilter === 0 ? "全部状态" : (statusMap[internalStatusFilter]?.label ?? "全部状态")} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="全部状态">全部状态</SelectItem>
              <SelectItem value="待处理">待处理</SelectItem>
              <SelectItem value="已完成">已完成</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {onRefresh && (
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <IconRefresh className="size-4 mr-2" />
            刷新
          </Button>
        )}
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
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
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

      {/* 统计信息 */}
      <div className="flex items-center justify-end">
        <span className="text-sm text-muted-foreground">
          共 {filteredData.length} 个任务
        </span>
      </div>
    </div>
  )
}
