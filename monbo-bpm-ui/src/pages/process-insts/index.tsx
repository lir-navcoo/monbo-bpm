"use client"

import * as React from "react"
import { ProcessInstDataTable } from "./data-table"
import api, { extractData } from "@/lib/api"
import type { ProcessInst } from "./data-table"

interface ProcessInstPageData {
  records: ProcessInst[]
  total: number
  pages: number
  current: number
  size: number
}

export default function ProcessInstListPage() {
  const [data, setData] = React.useState<ProcessInst[]>([])
  const [loading, setLoading] = React.useState(true)
  const [pageNum, setPageNum] = React.useState(1)
  const [pageSize] = React.useState(10)
  const [total, setTotal] = React.useState(0)

  const fetchData = React.useCallback(async (page: number) => {
    setLoading(true)
    try {
      const res = await api.get("/process-insts", {
        params: { pageNum: page, pageSize },
      })
      const result = extractData(res) as ProcessInstPageData | null
      if (result?.records) {
        setData(result.records as any[])
        setTotal(result.total)
        setPageNum(result.current)
      }
    } catch (err) {
      console.error("Failed to fetch process instances:", err)
    } finally {
      setLoading(false)
    }
  }, [pageSize])

  React.useEffect(() => {
    fetchData(pageNum)
  }, [fetchData, pageNum])

  const handlePageChange = (newPage: number) => {
    setPageNum(newPage)
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <ProcessInstDataTable
        data={data}
        loading={loading}
        pagination={{ pageNum, pageSize, total, onPageChange: handlePageChange }}
      />
    </div>
  )
}
