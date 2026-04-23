import { useState, useEffect } from "react"
import { toast } from "sonner"
import {
  fetchRoles,
  createRole,
  updateRole,
  deleteRole,
  type Role,
  type RoleFormData,
} from "@/lib/api"
import { RoleDataTable } from "./data-table"

const emptyForm: RoleFormData = {
  roleName: "",
  roleCode: "",
  description: "",
  status: 1,
}

export default function RoleListPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [form, setForm] = useState<RoleFormData>(emptyForm)
  const [saving, setSaving] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await fetchRoles()
      setRoles(data || [])
    } catch {
      toast.error("加载角色列表失败")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      if (editId) {
        await updateRole(editId, form)
        toast.success("更新成功")
      } else {
        await createRole(form)
        toast.success("创建成功")
      }
      setDialogOpen(false)
      loadData()
    } catch (err: any) {
      toast.error(err.message || (editId ? "更新失败" : "创建失败"))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteRole(id)
      toast.success("删除成功")
      setDeleteId(null)
      loadData()
    } catch (err: any) {
      toast.error(err.message || "删除失败")
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <RoleDataTable
        data={roles}
        editId={editId}
        dialogOpen={dialogOpen}
        deleteId={deleteId}
        form={form}
        onSetDialogOpen={setDialogOpen}
        onSetDeleteId={setDeleteId}
        onFormChange={setForm}
        onEdit={(role) => {
          setEditId(role.id)
          setForm({
            roleName: role.roleName || "",
            roleCode: role.roleCode || "",
            description: role.description || "",
            status: role.status ?? 1,
          })
          setDialogOpen(true)
        }}
        onDelete={handleDelete}
        onSave={handleSave}
        saving={saving}
        loading={loading}
      />
    </div>
  )
}
