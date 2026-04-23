"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import {
  fetchDepartments,
  fetchUsersPage,
  createUser,
  updateUser,
  deleteUser,
  fetchRoles,
  type Department,
  type SysUserFormData,
  type SysUserPage,
} from "@/lib/api"
import { UserDataTable } from "./data-table"

const PAGE_SIZE = 10
const emptyForm: SysUserFormData = {
  username: "",
  password: "",
  realName: "",
  email: "",
  phone: "",
  deptId: null,
  roleIds: [],
  status: 1,
}

export default function UserListPage() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [roles, setRoles] = useState<{ id: number; roleName: string }[]>([])
  const [selectedDeptId, setSelectedDeptId] = useState<number | null>(null)
  const [usersPage, setUsersPage] = useState<SysUserPage>({
    records: [],
    total: 0,
    pages: 0,
    current: 1,
    size: PAGE_SIZE,
  })
  const [pageNum, setPageNum] = useState(1)
  const [searchText, setSearchText] = useState("")
  const [loading, setLoading] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [form, setForm] = useState<SysUserFormData>(emptyForm)
  const [saving, setSaving] = useState(false)

  // 加载部门树
  const loadDepts = useCallback(async () => {
    try {
      const data = await fetchDepartments()
      setDepartments(data || [])
    } catch {
      // 静默
    }
  }, [])

  // 加载用户分页数据
  const loadUsers = useCallback(async (pg: number, deptId: number | null, username: string) => {
    setLoading(true)
    try {
      const page = await fetchUsersPage({
        pageNum: pg,
        pageSize: PAGE_SIZE,
        username: username || undefined,
        deptId: deptId,
      })
      setUsersPage(page)
    } catch {
      toast.error("加载用户列表失败")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDepts()
    loadRoles()
  }, [loadDepts])

  useEffect(() => {
    loadUsers(pageNum, selectedDeptId, searchText)
  }, [pageNum, selectedDeptId, searchText, loadUsers])

  const loadRoles = async () => {
    try {
      const data = await fetchRoles()
      setRoles(data || [])
    } catch {
      // 静默
    }
  }

  const handlePageChange = (newPage: number) => {
    setPageNum(newPage)
  }

  const handleDeptSelect = (deptId: number | null) => {
    setSelectedDeptId(deptId)
    setPageNum(1) // 切部门重置到第一页
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (editId) {
        await updateUser(editId, form)
        toast.success("更新成功")
      } else {
        await createUser(form)
        toast.success("创建成功")
      }
      setDialogOpen(false)
      loadUsers(pageNum, selectedDeptId, searchText)
    } catch (err: any) {
      toast.error(err.message || (editId ? "更新失败" : "创建失败"))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteUser(id)
      toast.success("删除成功")
      setDeleteId(null)
      loadUsers(pageNum, selectedDeptId, searchText)
    } catch (err: any) {
      toast.error(err.message || "删除失败")
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <UserDataTable
        departments={departments}
        roles={roles}
        selectedDeptId={selectedDeptId}
        onDeptSelect={handleDeptSelect}
        usersPage={usersPage}
        pageNum={pageNum}
        onPageChange={handlePageChange}
        searchText={searchText}
        onSearchChange={setSearchText}
        editId={editId}
        dialogOpen={dialogOpen}
        deleteId={deleteId}
        form={form}
        onSetDialogOpen={setDialogOpen}
        onSetDeleteId={setDeleteId}
        onFormChange={setForm}
        onEdit={(user) => {
          setEditId(user.id)
          setForm({
            username: user.username,
            password: "",
            realName: user.realName || "",
            email: user.email || "",
            phone: user.phone || "",
            deptId: user.deptId,
            roleIds: user.roleIds || [],
            status: user.status,
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
