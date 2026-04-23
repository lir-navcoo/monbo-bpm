"use client"

import * as React from "react"
import { useParams, useNavigate } from "react-router-dom"
import { IconArrowLeft, IconDeviceFloppy, IconUpload } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { processDefApi } from "@/lib/api/process-def"
import type { ProcessDefRespDTO } from "@/lib/types"

export default function ProcessDesignPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [processDef, setProcessDef] = React.useState<ProcessDefRespDTO | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [publishing, setPublishing] = React.useState(false)

  // 暂存的修改
  const [pendingName, setPendingName] = React.useState<string>("")
  const [pendingBpmnXml, setPendingBpmnXml] = React.useState<string | undefined>()
  const [pendingSvgXml, setPendingSvgXml] = React.useState<string | undefined>()
  const [hasPendingChanges, setHasPendingChanges] = React.useState(false)

  // 标题编辑状态
  const [editingName, setEditingName] = React.useState(false)
  const [nameInput, setNameInput] = React.useState("")
  const nameInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (!id) return
    processDefApi.getById(Number(id)).then((res: { data: ProcessDefRespDTO }) => {
      setProcessDef(res.data)
      setPendingName(res.data.processName)
      setNameInput(res.data.processName)
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })
  }, [id])

  // 点击标题进入编辑
  const handleNameClick = () => {
    setNameInput(pendingName)
    setEditingName(true)
    setTimeout(() => nameInputRef.current?.select(), 0)
  }

  // 标题编辑完成（失焦或回车）
  const handleNameChange = () => {
    const trimmed = nameInput.trim()
    if (trimmed && trimmed !== pendingName) {
      setPendingName(trimmed)
      setHasPendingChanges(true)
    }
    setEditingName(false)
  }

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur()
    }
  }

  // 保存（仅暂存的变更）
  const handleSave = async () => {
    if (!processDef || saving) return
    setSaving(true)
    try {
      await processDefAPI.update(processDef.id, {
        processName: pendingName !== processDef.processName ? pendingName : undefined,
        bpmnXml: pendingBpmnXml,
        svgXml: pendingSvgXml,
      })
      // 更新本地状态
      setProcessDef({ ...processDef, processName: pendingName })
      setPendingBpmnXml(undefined)
      setPendingSvgXml(undefined)
      setHasPendingChanges(false)
    } finally {
      setSaving(false)
    }
  }

  // 发布
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

          {/* 可编辑标题 */}
          {editingName ? (
            <Input
              ref={nameInputRef}
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onBlur={handleNameChange}
              onKeyDown={handleNameKeyDown}
              className="h-8 max-w-64 font-semibold text-base"
              autoFocus
            />
          ) : (
            <span
              onClick={handleNameClick}
              className="font-semibold text-base cursor-pointer hover:text-primary transition-colors"
            >
              {pendingName}
            </span>
          )}

          <span className="text-sm text-muted-foreground">
            v{processDef.version}
          </span>

          {hasPendingChanges && (
            <span className="text-xs text-amber-500">(已修改)</span>
          )}
        </div>

        {/* 右侧：保存 + 发布按钮 */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={saving || !hasPendingChanges}
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
