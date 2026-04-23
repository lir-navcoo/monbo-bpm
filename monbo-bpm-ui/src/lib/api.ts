import axios from "axios";
import { useAuthStore } from "@/store/auth";

const api = axios.create({
  baseURL: "http://101.126.89.23",
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

// 从后端标准响应格式 {code, message, data} 中提取data，code非200则抛出错误
function extractData(res: any): any {
  const code = res?.data?.code;
  const message = res?.data?.message;
  if (code !== 200) {
    const err = new Error(message || "请求失败");
    (err as any).code = code;
    throw err;
  }
  return res?.data?.data ?? res?.data ?? null;
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  // 用分页接口的 total 字段算数量，避免 /count 接口不存在的问题
  // Promise.allSettled：每个请求独立，不因单个失败而全部失败
  const [users, procs, tasks, roles] = await Promise.allSettled([
    api.get("/api/users", { params: { pageNum: 1, pageSize: 1 } }),
    api.get("/api/process-insts", { params: { pageNum: 1, pageSize: 1 } }),
    api.get("/api/tasks", { params: { pageNum: 1, pageSize: 1 } }),
    api.get("/api/roles", { params: {} }),
  ]);

  function getTotal(result: PromiseSettledResult<unknown>): number {
    if (result.status === "rejected") {
      console.warn("stats request rejected:", result.reason);
      return 0;
    }
    const res = result.value;
    const d = (res as any)?.data?.data;
    // IPage 格式：{ records: [], total: N }
    if (typeof d?.total === "number") return d.total;
    // 直接数组（roles 等）
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
  id: string;
  processDefinitionKey: string;
  processDefinitionName: string;
  businessKey: string;
  startTime: string;
  endTime: string | null;
  startUserId: string;
  status: string;
}

export async function fetchRecentProcessInstances(limit = 5): Promise<RecentProcessInstance[]> {
  const res = await api.get("/api/process-insts", {
    params: { page: 1, size: limit, sort: "startTime,desc" },
  }).catch(() => ({ data: null }));
  const data = extractData(res);
  return Array.isArray(data) ? data : [];
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
  const res = await api.get("/api/tasks", {
    params: { page: 1, size: limit, sort: "createTime,desc" },
  }).catch(() => ({ data: null }));
  const data = extractData(res);
  return Array.isArray(data) ? data : [];
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
  const res = await api.get("/api/departments").catch(() => ({ data: null }));
  const data = extractData(res);
  return Array.isArray(data) ? data : [];
}

export async function createDepartment(data: DepartmentFormData): Promise<number> {
  const res = await api.post("/api/departments", data);
  return extractData(res);
}

export async function updateDepartment(id: number, data: DepartmentFormData): Promise<void> {
  const res = await api.put(`/api/departments/${id}`, data);
  extractData(res);
}

export async function deleteDepartment(id: number): Promise<void> {
  await api.delete(`/api/departments/${id}`);
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
  realName?: string;
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
  const res = await api.get("/api/users", { params }).catch(() => ({ data: null }));
  const data = extractData(res);
  if (data && typeof data === "object" && "records" in data) {
    return data as SysUserPage;
  }
  // 兼容非分页返回（理论上不会走到这里）
  return {
    records: Array.isArray(data) ? data : [],
    total: Array.isArray(data) ? data.length : 0,
    pages: 1,
    current: 1,
    size: params.pageSize,
  };
}

export async function createUser(data: SysUserFormData): Promise<number> {
  const res = await api.post("/api/users", data);
  return extractData(res);
}

export async function updateUser(id: number, data: SysUserFormData): Promise<void> {
  const res = await api.put(`/api/users/${id}`, data);
  extractData(res);
}

export async function deleteUser(id: number): Promise<void> {
  await api.delete(`/api/users/${id}`);
}

// ============ 获取所有用户（用于负责人下拉） ============
interface FetchUsersOptions {
  pageNum?: number
  pageSize?: number
  username?: string
}

export async function fetchAllUsers(
  options: FetchUsersOptions = {}
): Promise<SysUser[]> {
  const { pageNum = 1, pageSize = 1000, username } = options
  const params: Record<string, unknown> = { pageNum, pageSize }
  if (username) params.username = username
  const res = await api.get("/api/users", { params }).catch(() => ({ data: null }))
  const data = extractData(res)
  if (data && Array.isArray(data.records)) return data.records as SysUser[]
  return []
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
  const res = await api.get("/api/roles").catch(() => ({ data: null }));
  const data = extractData(res);
  return Array.isArray(data) ? data as Role[] : [];
}

export async function fetchRole(id: number): Promise<Role> {
  const res = await api.get(`/api/roles/${id}`);
  return extractData(res) as Role;
}

export async function createRole(data: RoleFormData): Promise<number> {
  const res = await api.post("/api/roles", data);
  return extractData(res) as number;
}

export async function updateRole(id: number, data: RoleFormData): Promise<void> {
  const res = await api.put(`/api/roles/${id}`, data);
  extractData(res);
}

export async function deleteRole(id: number): Promise<void> {
  const res = await api.delete(`/api/roles/${id}`);
  extractData(res);
}
