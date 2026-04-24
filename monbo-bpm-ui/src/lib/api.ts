import axios from "axios";
import { useAuthStore } from "@/store/auth";

const api = axios.create({
  baseURL: "/api",
  timeout: 10000,
});

// 请求拦截：注入token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截：401跳转登录
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;

// 从后端标准响应格式 {code, message, data} 中提取data，code非200则抛出错误
export function extractData(res: any): any {
  const code = res?.data?.code;
  const message = res?.data?.message;
  if (code !== 200) {
    const err = new Error(message || "请求失败");
    (err as any).code = code;
    throw err;
  }
  return res?.data?.data ?? res?.data ?? null;
}

// ============ 仪表盘统计 ============
export interface DashboardStats {
  totalUsers: number;
  totalProcessInstances: number;
  pendingTasks: number;
  totalRoles: number;
  userTrend: number;
  processTrend: number;
  taskTrend: number;
  roleTrend: number;
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const [users, procs, tasks, roles] = await Promise.allSettled([
    api.get("/users", { params: { pageNum: 1, pageSize: 1 } }),
    api.get("/process-insts", { params: { pageNum: 1, pageSize: 1 } }),
    api.get("/tasks/my"),
    api.get("/roles"),
  ]);

  function getTotal(result: PromiseSettledResult<unknown>): number {
    if (result.status === "rejected") {
      console.warn("stats request rejected:", result.reason);
      return 0;
    }
    const d = (result.value as any)?.data?.data;
    if (typeof d?.total === "number") return d.total;
    if (Array.isArray(d)) return d.length;
    return 0;
  }

  return {
    totalUsers: getTotal(users),
    totalProcessInstances: getTotal(procs),
    pendingTasks: getTotal(tasks),
    totalRoles: getTotal(roles),
    userTrend: 0,
    processTrend: 0,
    taskTrend: 0,
    roleTrend: 0,
  };
}

// ============ 最近流程实例 ============
export interface RecentProcessInstance {
  id: number;
  processDefinitionKey: string;
  processDefinitionName: string;
  businessKey: string;
  startTime: string;
  endTime: string | null;
  startUserId: number;
  status: string;
}

export async function fetchRecentProcessInstances(limit = 5): Promise<RecentProcessInstance[]> {
  const res = await api.get("/process-insts", {
    params: { pageNum: 1, pageSize: limit },
  }).catch(() => ({ data: null }));
  const data = extractData(res);
  if (!data || !data.records) return [];
  return (data.records as any[]).map((item: any) => ({
    id: item.id,
    processDefinitionKey: item.processDefKey || "",
    processDefinitionName: item.processDefName || "",
    businessKey: item.businessKey || "",
    startTime: item.createdTime || "",
    endTime: item.endedTime || null,
    startUserId: item.starterId || 0,
    status: item.status === 1 ? "RUNNING" : item.status === 2 ? "COMPLETED" : item.status === 3 ? "CANCELED" : "UNKNOWN",
  }));
}

// ============ 待办任务 ============
export interface PendingTask {
  id: string;
  name: string;
  processInstanceId: string;
  assignee: string;
  createTime: string;
  priority: number;
}

export async function fetchPendingTasks(limit = 5): Promise<PendingTask[]> {
  const res = await api.get("/tasks/my").catch(() => ({ data: null }));
  const data = extractData(res);
  if (!Array.isArray(data)) return [];
  return data.slice(0, limit).map((item: any) => ({
    id: item.camundaTaskId || String(item.id),
    name: item.taskName || "",
    processInstanceId: item.camundaProcessInstId || "",
    assignee: item.assignee || "",
    createTime: item.createdTime || "",
    priority: item.priority || 0,
  }));
}

// ============ 部门管理 ============
export interface Department {
  id: number;
  parentId: number | null;
  deptName: string;
  deptCode: string;
  leader: string;
  phone: string;
  email: string;
  sortOrder: number;
  status: number;
  createdTime: string;
  updatedTime: string;
  children?: Department[];
}

export interface DepartmentFormData {
  deptName: string;
  deptCode: string;
  parentId?: number | null;
  leader?: string;
  phone?: string;
  email?: string;
  sortOrder?: number;
  status?: number;
}

export async function fetchDepartments(): Promise<Department[]> {
  const res = await api.get("/departments").catch(() => ({ data: null }));
  const data = extractData(res);
  return Array.isArray(data) ? data : [];
}

export async function createDepartment(data: DepartmentFormData): Promise<number> {
  const res = await api.post("/departments", data);
  return extractData(res);
}

export async function updateDepartment(id: number, data: DepartmentFormData): Promise<void> {
  const res = await api.put(`/departments/${id}`, data);
  extractData(res);
}

export async function deleteDepartment(id: number): Promise<void> {
  await api.delete(`/departments/${id}`);
}

// ============ 用户管理（分页） ============
export interface SysUser {
  id: number;
  username: string;
  realName: string;
  email: string;
  phone: string;
  deptId: number | null;
  deptName: string;
  roleIds: number[];
  roleNames: string[];
  status: number;
  createdTime: string;
  updatedTime: string;
}

export interface SysUserPage {
  records: SysUser[];
  total: number;
  pages: number;
  current: number;
  size: number;
}

export interface SysUserFormData {
  username: string;
  password?: string;
  realName: string;
  email?: string;
  phone?: string;
  deptId?: number | null;
  roleIds?: number[];
  status?: number;
}

export async function fetchUsersPage(params: {
  pageNum: number;
  pageSize: number;
  username?: string;
  deptId?: number | null;
}): Promise<SysUserPage> {
  const res = await api.get("/users", { params }).catch(() => ({ data: null }));
  const data = extractData(res);
  if (data && typeof data === "object" && "records" in data) {
    return data as SysUserPage;
  }
  return {
    records: Array.isArray(data) ? data : [],
    total: Array.isArray(data) ? data.length : 0,
    pages: 1,
    current: 1,
    size: params.pageSize,
  };
}

export async function createUser(data: SysUserFormData): Promise<number> {
  const res = await api.post("/users", data);
  return extractData(res);
}

export async function updateUser(id: number, data: SysUserFormData): Promise<void> {
  const res = await api.put(`/users/${id}`, data);
  extractData(res);
}

export async function deleteUser(id: number): Promise<void> {
  await api.delete(`/users/${id}`);
}

// ============ 获取所有用户（用于负责人下拉） ============
interface FetchUsersOptions {
  pageNum?: number;
  pageSize?: number;
  username?: string;
}

export async function fetchAllUsers(
  options: FetchUsersOptions = {}
): Promise<SysUser[]> {
  const { pageNum = 1, pageSize = 1000, username } = options;
  const params: Record<string, unknown> = { pageNum, pageSize };
  if (username) params.username = username;
  const res = await api.get("/users", { params }).catch(() => ({ data: null }));
  const data = extractData(res);
  if (data && Array.isArray(data.records)) return data.records as SysUser[];
  return [];
}

// ============ 角色管理 ============
export interface Role {
  id: number;
  roleCode: string;
  roleName: string;
  description: string;
  status: number;
  createdTime: string;
  updatedTime: string;
}

export interface RoleFormData {
  roleName: string;
  roleCode: string;
  description?: string;
  status?: number;
}

export async function fetchRoles(): Promise<Role[]> {
  const res = await api.get("/roles").catch(() => ({ data: null }));
  const data = extractData(res);
  return Array.isArray(data) ? data as Role[] : [];
}

export async function fetchRole(id: number): Promise<Role> {
  const res = await api.get(`/roles/${id}`);
  return extractData(res) as Role;
}

export async function createRole(data: RoleFormData): Promise<number> {
  const res = await api.post("/roles", data);
  return extractData(res) as number;
}

export async function updateRole(id: number, data: RoleFormData): Promise<void> {
  const res = await api.put(`/roles/${id}`, data);
  extractData(res);
}

export async function deleteRole(id: number): Promise<void> {
  const res = await api.delete(`/roles/${id}`);
  extractData(res);
}
