import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Loader2,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormField,
} from '@/components/ui/form';
import { userApi, type UserCreateDTO, type UserUpdateDTO } from '@/lib/api/user';
import { departmentApi, type DepartmentNode } from '@/lib/api/department';
import { ResponsiveList } from '@/components/layout/ResponsiveList';
import type { User } from '@/lib/types';

// Base schema without password (for edit mode)
const baseUserFormSchema = z.object({
  username: z.string().min(1, '用户名不能为空').max(50, '用户名最多50个字符'),
  email: z.string().email('请输入有效的邮箱地址').optional().or(z.literal('')),
  phone: z.string().regex(/^1[3-9]\d{9}$/, '请输入有效的手机号码').optional().or(z.literal('')),
  deptId: z.number().optional().nullable(),
});

// Schema for create (password required)
const createUserFormSchema = baseUserFormSchema.extend({
  password: z.string().min(1, '密码不能为空'),
});

// Schema for edit (password optional)
const editUserFormSchema = baseUserFormSchema.extend({
  password: z.string().optional(),
});

type CreateUserFormValues = z.infer<typeof createUserFormSchema>;
type EditUserFormValues = z.infer<typeof editUserFormSchema>;
type UserFormValues = CreateUserFormValues | EditUserFormValues;

const UserListPage = () => {
  // State
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Department state
  const [departments, setDepartments] = useState<DepartmentNode[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<string>('all');

  // Flatten department tree for dropdown
  const flatDepartments = useMemo(() => {
    const result: { id: number; label: string; level: number; deptName: string }[] = [];
    const flatten = (depts: DepartmentNode[], level: number) => {
      for (const dept of depts) {
        result.push({
          id: dept.id,
          label: '　'.repeat(level) + dept.deptName,
          level,
          deptName: dept.deptName,
        });
        if (dept.children?.length) {
          flatten(dept.children, level + 1);
        }
      }
    };
    flatten(departments, 0);
    return result;
  }, [departments]);

  // Form - conditionally use different schemas based on mode
  const form = useForm<UserFormValues>({
    resolver: zodResolver(editingUser ? editUserFormSchema : createUserFormSchema),
    defaultValues: {
      username: '',
      password: '',
      email: '',
      phone: '',
      deptId: undefined,
    },
  });

  // Reset form when dialog opens or editingUser changes
  useEffect(() => {
    if (dialogOpen) {
      form.reset({
        username: editingUser?.username || '',
        password: '',
        email: editingUser?.email || '',
        phone: editingUser?.phone || '',
      });
    }
  }, [editingUser, dialogOpen, form]);

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await userApi.getUsers({ page, pageSize, keyword, deptId: selectedDeptId && selectedDeptId !== 'all' ? Number(selectedDeptId) : undefined });
      if (resp.code === 200) {
        // BUILD_FIX_RECORDS_0422
        setUsers(resp.data.records || []);
        setTotal(resp.data.total || 0);
      } else {
        setError(resp.message || '获取用户列表失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      const resp = await departmentApi.list();
      setDepartments(resp || []);
    } catch (err) {
      console.error('获取部门列表失败', err);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [page, pageSize, keyword, selectedDeptId]);

  // Handle search
  const handleSearch = () => {
    setKeyword(searchKeyword);
    setPage(1);
  };

  // Handle enter key in search input
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Open dialog for add
  const handleOpenAdd = () => {
    setEditingUser(null);
    form.reset({
      username: '',
      password: '',
      email: '',
      phone: '',
      deptId: undefined,
    });
    setDialogOpen(true);
  };

  // Open dialog for edit
  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    form.reset({
      username: user.username || '',
      password: '',
      email: user.email || '',
      phone: user.phone || '',
      deptId: user.deptId ?? undefined,
    });
    setDialogOpen(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingUser(null);
  };

  // Handle form submit
  const onSubmit = async (data: UserFormValues) => {
    setDialogLoading(true);
    try {
      if (editingUser) {
        // Update existing user
        const updateData: UserUpdateDTO = {
          username: data.username,
          email: data.email || undefined,
          phone: data.phone || undefined,
          deptId: data.deptId ?? undefined,
        };
        if (data.password) {
          updateData.password = data.password;
        }
        const resp = await userApi.updateUser(editingUser.id!, updateData);
        if (resp.code !== 200) {
          throw new Error(resp.message || '更新用户失败');
        }
      } else {
        // Create new user
        const createData: UserCreateDTO = {
          username: data.username,
          password: (data as CreateUserFormValues).password,
          email: data.email || undefined,
          phone: data.phone || undefined,
          deptId: data.deptId ?? undefined,
        };
        const resp = await userApi.createUser(createData);
        if (resp.code !== 200) {
          throw new Error(resp.message || '创建用户失败');
        }
      }
      handleCloseDialog();
      fetchUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : '操作失败');
    } finally {
      setDialogLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (user: User) => {
    if (!user.id) return;
    if (!confirm(`确定要删除用户 "${user.username}" 吗？`)) return;

    setDeleteLoading(user.id);
    try {
      const resp = await userApi.deleteUser(user.id);
      if (resp.code !== 200) {
        throw new Error(resp.message || '删除用户失败');
      }
      fetchUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : '删除用户失败');
    } finally {
      setDeleteLoading(null);
    }
  };

  // Pagination
  const totalPages = Math.ceil(total / pageSize);
  const canPrev = page > 1;
  const canNext = page < totalPages;

  // Format date
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Status badge
  const StatusBadge = ({ status }: { status?: number }) => {
    if (status === 1) {
      return <Badge variant="default">启用</Badge>;
    }
    return <Badge variant="secondary">禁用</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">用户管理</h1>
        <Button onClick={handleOpenAdd}>
          <Plus className="w-4 h-4 mr-2" />
          新增用户
        </Button>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2 flex-wrap">
            <Input
              placeholder="搜索用户名、邮箱或手机号..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="max-w-sm"
            />
            <Select value={selectedDeptId} onValueChange={(v) => setSelectedDeptId(v || 'all')}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="选择部门..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部部门</SelectItem>
                {flatDepartments.map((dept) => (
                  <SelectItem key={dept.id} value={String(dept.id)}>
                    {dept.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleSearch} disabled={loading}>
              <Search className="w-4 h-4 mr-2" />
              搜索
            </Button>
            {selectedDeptId && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSelectedDeptId('all');
                  setKeyword('');
                  setSearchKeyword('');
                }}
              >
                重置
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-md">
          {error}
        </div>
      )}

      {/* Responsive List */}
      <ResponsiveList
        columns={[
          { key: 'id', label: 'ID', className: 'w-16' },
          { key: 'username', label: '用户名' },
          { key: 'email', label: '邮箱' },
          { key: 'phone', label: '手机' },
          { key: 'deptName', label: '部门', render: (u) => u.deptName || '-' },
          { key: 'status', label: '状态', render: (u) => <StatusBadge status={u.status} /> },
          { key: 'createTime', label: '创建时间', render: (u) => formatDate(u.createTime) },
          {
            key: 'actions',
            label: '操作',
            className: 'w-24',
            render: (u) => (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(u)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(u)}
                  disabled={deleteLoading === u.id}
                >
                  {deleteLoading === u.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 text-destructive" />
                  )}
                </Button>
              </div>
            ),
          },
        ]}
        data={users}
        keyField="id"
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
        deleteLoading={deleteLoading}
        emptyText="暂无用户数据"
      />
      {loading && (
        <div className="flex justify-center py-4">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          共 {total} 条，第 {page} / {totalPages} 页
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!canPrev || loading}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            上一页
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={!canNext || loading}
          >
            下一页
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser ? '编辑用户' : '新增用户'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>用户名 *</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入用户名" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      密码 {editingUser ? '(留空则不修改)' : '*'}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={editingUser ? '留空不修改' : '请输入密码'}
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>邮箱</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入邮箱" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>手机</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入手机号" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="deptId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>部门</FormLabel>
                    <Select
                      onValueChange={(val) => field.onChange(val === 'none' ? null : Number(val))}
                      value={field.value != null ? String(field.value) : 'none'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="请选择部门" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">无</SelectItem>
                        {flatDepartments.map((dept) => (
                          <SelectItem key={dept.id} value={String(dept.id)}>
                            {'　'.repeat(dept.level)}{dept.deptName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                  disabled={dialogLoading}
                >
                  取消
                </Button>
                <Button type="submit" disabled={dialogLoading}>
                  {dialogLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingUser ? '保存' : '创建'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserListPage;
