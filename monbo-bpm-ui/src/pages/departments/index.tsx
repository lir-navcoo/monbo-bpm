import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  fetchDepartments,
  fetchAllUsers,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  type Department,
  type DepartmentFormData,
  type SysUser,
} from "@/lib/api";
import { DepartmentDataTable } from "./data-table";

const emptyForm: DepartmentFormData = {
  deptName: "",
  deptCode: "",
  parentId: null,
  leader: "",
  phone: "",
  email: "",
  sortOrder: 0,
  status: 1,
};

export default function DepartmentListPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [allUsers, setAllUsers] = useState<SysUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState<DepartmentFormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const deptData = await fetchDepartments();
      setDepartments(deptData || []);
    } catch {
      toast.error("加载部门列表失败");
    } finally {
      setLoading(false);
    }
    try {
      const userData = await fetchAllUsers();
      setAllUsers(userData || []);
    } catch {
      // 用户列表失败不影响主流程
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editId) {
        await updateDepartment(editId, form);
        toast.success("更新成功");
      } else {
        await createDepartment(form);
        toast.success("创建成功");
      }
      setDialogOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || (editId ? "更新失败" : "创建失败"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteDepartment(id);
      toast.success("删除成功");
      loadData();
    } catch {
      toast.error("删除失败");
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4">
      <DepartmentDataTable
        data={departments}
        leaderUsers={allUsers}
        editId={editId}
        dialogOpen={dialogOpen}
        deleteId={deleteId}
        form={form}
        onSetDialogOpen={setDialogOpen}
        onSetDeleteId={setDeleteId}
        onFormChange={setForm}
        onEdit={(dept) => {
          setEditId(dept.id)
          setForm({
            deptName: dept.deptName,
            deptCode: dept.deptCode,
            parentId: dept.parentId,
            leader: dept.leader || "",
            phone: dept.phone || "",
            email: dept.email || "",
            sortOrder: dept.sortOrder,
            status: dept.status,
          })
          setDialogOpen(true)
        }}
        onDelete={handleDelete}
        onSave={handleSave}
        saving={saving}
        loading={loading}
      />
    </div>
  );
}
