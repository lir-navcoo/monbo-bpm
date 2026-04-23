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
  IconEye,
  IconX,
  IconXboxXFilled,
} from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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

export interface ProcessInst {
  id: number
  processDefId: number
  processName: string
  businessKey: string
  starterName: string
  status: number
  createdTime: string
}

interface DataTableProps {
  data: ProcessInst[]
  loading?: boolean
}

const statusMap: Record<number, { label: string; color: string }> = {
  1: { label: "运行中", color: "text-blue-500" },
  2: { label: "已完成", color: "text-green-500" },
  3: { label: "已取消", color: "text-muted-foreground" },
}

function formatTime(time?: string) {
  if (!time) return "-"
  return time.replace("T", " ").slice(0, 16)
}

export function ProcessInstDataTable(props: DataTableProps) {
  const { data, loading } = props

  const [searchText, setSearchText] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [filteredData, setFilteredData] = React.useState<ProcessInst[]>(data)

  React.useEffect(() => {
    const lower = searchText.toLowerCase()
    setFilteredData(
      data.filter((item) => {
        const matchSearch =
          !searchText ||
          item.processName.toLowerCase().includes(lower) ||
          item.businessKey.toLowerCase().includes(lower) ||
          item.starterName.toLowerCase().includes(lower)
        const matchStatus = statusFilter === "all" || String(item.status) === statusFilter
        return matchSearch && matchStatus
      })
    )
  }, [data, searchText, statusFilter])

  const [sorting] = React.useState([])
  const [columnVisibility] = React.useState({})

  const columns: ColumnDef<ProcessInst>[] = [
    {
      accessorKey: "businessKey",
      header: "业务Key",
      cell: ({ row }) => (
        <code className="text-xs font-mono">{row.original.businessKey}</code>
      ),
    },
    {
      accessorKey: "processName",
      header: "流程名称",
      cell: ({ row }) => <span className="font-medium">{row.original.processName}</span>,
    },
    {
      accessorKey: "starterName",
      header: "发起人",
      cell: ({ row }) => row.original.starterName || "-",
    },
    {
      accessorKey: "status",
      header: "状态",
      cell: ({ row }) => {
        const s = statusMap[row.original.status]
        return (
          <Badge variant="outline" className="px-1.5 text-muted-foreground flex items-center gap-1">
            {row.original.status === 1 ? (
              <span className="size-1.5 rounded-full bg-blue-500" />
            ) : row.original.status === 2 ? (
              <IconCircleCheckFilled className="fill-green-500 dark:fill-green-400 size-3" />
            ) : (
              <IconXboxXFilled className="text-muted-foreground size-3" />
            )}
            {s?.label ?? "未知"}
          </Badge>
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
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">
                    <IconX className="size-4 mr-2" />
                    取消流程
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
        <Button>
          新建流程实例
        </Button>
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
    </div>
  )
}
