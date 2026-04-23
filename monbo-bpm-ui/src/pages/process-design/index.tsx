"use client"

import * as React from "react"
import { useParams, useNavigate } from "react-router-dom"
import { IconArrowLeft, IconDeviceFloppy, IconUpload } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { processDefAPI } from "@/lib/api/process-def"
import type { ProcessDefRespDTO } from "@/lib/types"

export default function ProcessDesignPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [processDef, setProcessDef] = React.useState<ProcessDefRespDTO | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [publishing, setPublishing] = React.useState(false)

  React.useEffect(() => {
    if (!id) return
    processDefAPI.getById(Number(id)).then((res) => {
      setProcessDef(res.data)
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })
  }, [id])

  const handleSave = async () => {
    if (!processDef || saving) return
    setSaving(true)
    try {
      // TODO: 调用保存接口
      console.log("保存流程定义")
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async () => {
    if (!processDef || publishing) return
    setPublishing(true)
    try {
      // TODO: 调用发布接口
      console.log("发布流程")
    } finally {
      setPublishing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    )
  }

  if (!processDef) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-muted-foreground">流程定义不存在</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* 顶部栏 */}
      <header className="flex h-14 shrink-0 items-center gap-4 border-b bg-card px-4">
        {/* 左侧：返回按钮 + 标题 + 版本号 */}
        <div className="flex items-center gap-3 flex-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/process-defs")}
          >
            <IconArrowLeft className="size-5" />
          </Button>
          <span className="font-semibold text-base">
            {processDef.processName}
          </span>
          <span className="text-sm text-muted-foreground">
            v{processDef.version}
          </span>
        </div>

        {/* 右侧：保存 + 发布按钮 */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={saving}
          >
            <IconDeviceFloppy className="size-4 mr-1" />
            {saving ? "保存中..." : "保存"}
          </Button>
          <Button
            onClick={handlePublish}
            disabled={publishing}
          >
            <IconUpload className="size-4 mr-1" />
            {publishing ? "发布中..." : "发布"}
          </Button>
        </div>
      </header>

      {/* 画布区域（后续集成BPMN编辑器） */}
      <div className="flex-1 overflow-hidden bg-muted/20">
        <div className="flex items-center justify-center h-full text-muted-foreground">
          {processDef.bpmnXml ? "BPMN 画布区域" : "暂无流程图，请上传 BPMN XML"}
        </div>
      </div>
    </div>
  )
}
