// API 类型声明文件

// ========== 通用响应结构 ==========
interface ApiResult<T = any> {
  code: number
  msg: string
  data: T
}

// ========== Auth 模块 ==========
interface LoginReq {
  username: string
  password: string
}

interface LoginRes {
  token: string
  username: string
}

interface AuthInfoRes {
  username: string
  authorities: string[]
}

interface RegisterReq {
  username: string
  password: string
  email?: string
}

// ========== User 模块 ==========
interface User {
  id: number
  username: string
  email?: string
  phone?: string
  status: number
  deptId?: number
  createTime?: string
  updateTime?: string
}

interface UserPageReq {
  page: number
  pageSize: number
  username?: string
  status?: number
  deptId?: number
}

interface UserPageRes {
  records: User[]
  total: number
  size: number
  current: number
}

interface CreateUserReq {
  username: string
  password: string
  email?: string
  phone?: string
  deptId?: number
  roleIds?: number[]
}

interface UpdateUserReq {
  username?: string
  email?: string
  phone?: string
  status?: number
  deptId?: number
  roleIds?: number[]
}

interface UpdatePasswordReq {
  oldPassword: string
  newPassword: string
}

// ========== Role 模块 ==========
interface Role {
  id: number
  roleCode: string
  roleName: string
  description?: string
  status: number
  createTime?: string
  updateTime?: string
}

interface RolePageReq {
  page: number
  pageSize: number
  roleName?: string
  status?: number
}

interface RolePageRes {
  records: Role[]
  total: number
  size: number
  current: number
}

interface CreateRoleReq {
  roleCode: string
  roleName: string
  description?: string
  menuIds?: number[]
}

interface UpdateRoleReq {
  roleName?: string
  description?: string
  status?: number
  menuIds?: number[]
}

// ========== Department 模块 ==========
interface Department {
  id: number
  deptName: string
  parentId?: number
  sortOrder?: number
  leader?: string
  phone?: string
  status: number
  children?: Department[]
  createTime?: string
  updateTime?: string
}

interface DeptPageReq {
  page: number
  pageSize: number
  deptName?: string
}

interface DeptPageRes {
  records: Department[]
  total: number
  size: number
  current: number
}

interface CreateDeptReq {
  deptName: string
  parentId?: number
  sortOrder?: number
  leader?: string
  phone?: string
}

interface UpdateDeptReq {
  deptName?: string
  parentId?: number
  sortOrder?: number
  leader?: string
  phone?: string
  status?: number
}

// ========== Process Definition 模块 ==========
interface ProcessDef {
  id: number
  processKey: string
  processName: string
  description?: string
  version: number
  camundaProcessDefId: string
  deploymentId: string
  resourceName: string
  diagramName?: string
  status: number
  createTime?: string
  updateTime?: string
}

interface ProcessDefPageReq {
  page: number
  pageSize: number
  processKey?: string
  processName?: string
  status?: number
}

interface ProcessDefPageRes {
  records: ProcessDef[]
  total: number
  size: number
  current: number
}

interface CreateProcessDefReq {
  processKey: string
  processName: string
  description?: string
  file: File
}

interface UpdateProcessDefReq {
  processName?: string
  description?: string
  status?: number
}

interface RedeployProcessDefReq {
  file: File
}

// ========== Process Instance 模块 ==========
interface ProcessInst {
  id: number
  processDefId: number
  businessKey?: string
  processKey: string
  processName: string
  version: number
  status: number
  startUserId: number
  startUsername?: string
  startTime?: string
  endTime?: string
}

interface ProcessInstPageReq {
  page: number
  pageSize: number
  processDefId?: number
  status?: number
}

interface ProcessInstPageRes {
  records: ProcessInst[]
  total: number
  size: number
  current: number
}

interface StartProcessInstReq {
  processKey: string
  businessKey?: string
  variables?: Record<string, any>
}

// ========== Task 模块 ==========
interface Task {
  id: number
  taskId: string
  taskName: string
  processInstId: number
  processDefId: number
  processKey: string
  processName: string
  businessKey?: string
  assignee?: string
  assigneeName?: string
  candidateUsers?: string[]
  candidateGroups?: string[]
  dueDate?: string
  priority: number
  status: string
  createTime?: string
  completeTime?: string
}

interface TaskPageReq {
  page: number
  pageSize: number
  processKey?: string
  assignee?: string
}

interface TaskPageRes {
  records: Task[]
  total: number
  size: number
  current: number
}

interface CompleteTaskReq {
  taskId: string
  variables?: Record<string, any>
  comment?: string
}

interface ClaimTaskReq {
  taskId: string
}

interface UnclaimTaskReq {
  taskId: string
}

interface DelegateTaskReq {
  taskId: string
  userId: string
}

interface ClaimableTaskRes {
  records: Task[]
  total: number
  size: number
  current: number
}

interface HistoryTaskRes {
  records: Task[]
  total: number
  size: number
  current: number
}
