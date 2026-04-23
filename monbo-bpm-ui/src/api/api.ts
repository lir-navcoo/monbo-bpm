// API 接口封装
import request from "./index";

// ========== Auth ==========
// 登录
export const LoginAPI = (params: LoginReq): Promise<ApiResult<LoginRes>> =>
  request.post('/api/auth/login', params)

// 注册
export const RegisterAPI = (params: RegisterReq): Promise<ApiResult<void>> =>
  request.post('/api/auth/register', params)

// 获取当前用户信息
export const AuthInfoAPI = (): Promise<ApiResult<AuthInfoRes>> =>
  request.get('/api/auth/info')

// ========== User ==========
// 分页查询用户
export const UserPageAPI = (params: UserPageReq): Promise<ApiResult<UserPageRes>> =>
  request.get('/api/users', { params })

// 获取用户详情
export const UserDetailAPI = (id: number): Promise<ApiResult<User>> =>
  request.get(`/api/users/${id}`)

// 创建用户
export const UserCreateAPI = (params: CreateUserReq): Promise<ApiResult<void>> =>
  request.post('/api/users', params)

// 更新用户
export const UserUpdateAPI = (id: number, params: UpdateUserReq): Promise<ApiResult<void>> =>
  request.put(`/api/users/${id}`, params)

// 删除用户
export const UserDeleteAPI = (id: number): Promise<ApiResult<void>> =>
  request.delete(`/api/users/${id}`)

// 分配用户角色
export const UserAssignRolesAPI = (id: number, roleIds: number[]): Promise<ApiResult<void>> =>
  request.put(`/api/users/${id}/roles`, roleIds)

// 获取用户角色
export const UserRolesAPI = (id: number): Promise<ApiResult<Role[]>> =>
  request.get(`/api/users/${id}/roles`)

// 修改密码
export const UserPasswordAPI = (id: number, params: UpdatePasswordReq): Promise<ApiResult<void>> =>
  request.put(`/api/users/${id}/password`, params)

// ========== Role ==========
// 分页查询角色
export const RolePageAPI = (params: RolePageReq): Promise<ApiResult<RolePageRes>> =>
  request.get('/api/roles', { params })

// 获取角色详情
export const RoleDetailAPI = (id: number): Promise<ApiResult<Role>> =>
  request.get(`/api/roles/${id}`)

// 创建角色
export const RoleCreateAPI = (params: CreateRoleReq): Promise<ApiResult<void>> =>
  request.post('/api/roles', params)

// 更新角色
export const RoleUpdateAPI = (id: number, params: UpdateRoleReq): Promise<ApiResult<void>> =>
  request.put(`/api/roles/${id}`, params)

// 删除角色
export const RoleDeleteAPI = (id: number): Promise<ApiResult<void>> =>
  request.delete(`/api/roles/${id}`)

// 分配角色用户
export const RoleAssignUsersAPI = (id: number, userIds: number[]): Promise<ApiResult<void>> =>
  request.put(`/api/roles/${id}/users`, userIds)

// 获取角色用户
export const RoleUsersAPI = (id: number): Promise<ApiResult<User[]>> =>
  request.get(`/api/roles/${id}/users`)

// ========== Department ==========
// 分页查询部门
export const DeptPageAPI = (params: DeptPageReq): Promise<ApiResult<DeptPageRes>> =>
  request.get('/api/departments', { params })

// 获取部门详情
export const DeptDetailAPI = (id: number): Promise<ApiResult<Department>> =>
  request.get(`/api/departments/${id}`)

// 创建部门
export const DeptCreateAPI = (params: CreateDeptReq): Promise<ApiResult<void>> =>
  request.post('/api/departments', params)

// 更新部门
export const DeptUpdateAPI = (id: number, params: UpdateDeptReq): Promise<ApiResult<void>> =>
  request.put(`/api/departments/${id}`, params)

// 删除部门
export const DeptDeleteAPI = (id: number): Promise<ApiResult<void>> =>
  request.delete(`/api/departments/${id}`)

// 分配部门用户
export const DeptAssignUsersAPI = (id: number, userIds: number[]): Promise<ApiResult<void>> =>
  request.put(`/api/departments/${id}/users`, userIds)

// 获取部门用户
export const DeptUsersAPI = (id: number): Promise<ApiResult<User[]>> =>
  request.get(`/api/departments/${id}/users`)

// ========== Process Definition ==========
// 分页查询流程定义
export const ProcessDefPageAPI = (params: ProcessDefPageReq): Promise<ApiResult<ProcessDefPageRes>> =>
  request.get('/api/process-defs', { params })

// 获取流程定义详情
export const ProcessDefDetailAPI = (id: number): Promise<ApiResult<ProcessDef>> =>
  request.get(`/api/process-defs/${id}`)

// 获取流程定义（通过key）
export const ProcessDefByKeyAPI = (processKey: string): Promise<ApiResult<ProcessDef>> =>
  request.get(`/api/process-defs/key/${processKey}`)

// 上传创建流程定义
export const ProcessDefCreateAPI = (params: CreateProcessDefReq): Promise<ApiResult<void>> =>
  request.post('/api/process-defs', params)

// 更新流程定义
export const ProcessDefUpdateAPI = (id: number, params: UpdateProcessDefReq): Promise<ApiResult<void>> =>
  request.put(`/api/process-defs/${id}`, params)

// 重新部署流程定义
export const ProcessDefRedeployAPI = (id: number): Promise<ApiResult<void>> =>
  request.post(`/api/process-defs/${id}/redeploy`)

// 激活流程定义
export const ProcessDefActivateAPI = (id: number): Promise<ApiResult<void>> =>
  request.put(`/api/process-defs/${id}/activate`)

// 挂起流程定义
export const ProcessDefSuspendAPI = (id: number): Promise<ApiResult<void>> =>
  request.put(`/api/process-defs/${id}/suspend`)

// 删除流程定义
export const ProcessDefDeleteAPI = (id: number): Promise<ApiResult<void>> =>
  request.delete(`/api/process-defs/${id}`)

// ========== Process Instance ==========
// 分页查询流程实例
export const ProcessInstPageAPI = (params: ProcessInstPageReq): Promise<ApiResult<ProcessInstPageRes>> =>
  request.get('/api/process-insts', { params })

// 获取流程实例详情
export const ProcessInstDetailAPI = (id: number): Promise<ApiResult<ProcessInst>> =>
  request.get(`/api/process-insts/${id}`)

// 获取我的流程实例
export const ProcessInstMyAPI = (params: ProcessInstPageReq): Promise<ApiResult<ProcessInstPageRes>> =>
  request.get('/api/process-insts/my', { params })

// 获取流程实例（通过businessKey）
export const ProcessInstByKeyAPI = (businessKey: string): Promise<ApiResult<ProcessInst>> =>
  request.get(`/api/process-insts/by-key/${businessKey}`)

// 取消流程实例
export const ProcessInstCancelAPI = (id: number): Promise<ApiResult<void>> =>
  request.put(`/api/process-insts/${id}/cancel`)

// ========== Task ==========
// 分页查询我的任务
export const TaskMyAPI = (params: TaskPageReq): Promise<ApiResult<TaskPageRes>> =>
  request.get('/api/tasks/my', { params })

// 获取任务详情
export const TaskDetailAPI = (taskId: string): Promise<ApiResult<Task>> =>
  request.get(`/api/tasks/${taskId}`)

// 领取任务
export const TaskClaimAPI = (params: ClaimTaskReq): Promise<ApiResult<void>> =>
  request.post('/api/tasks/claim', params)

// 归还任务
export const TaskUnclaimAPI = (params: UnclaimTaskReq): Promise<ApiResult<void>> =>
  request.post('/api/tasks/unclaim', params)

// 完成任务
export const TaskCompleteAPI = (params: CompleteTaskReq): Promise<ApiResult<void>> =>
  request.post('/api/tasks/complete', params)

// 转交任务
export const TaskDelegateAPI = (params: DelegateTaskReq): Promise<ApiResult<void>> =>
  request.post('/api/tasks/delegate', params)

// 分页查询可领取任务
export const TaskClaimableAPI = (params: TaskPageReq): Promise<ApiResult<ClaimableTaskRes>> =>
  request.get('/api/tasks/claimable', { params })

// 分页查询历史任务
export const TaskHistoryAPI = (params: TaskPageReq): Promise<ApiResult<HistoryTaskRes>> =>
  request.get('/api/tasks/history', { params })
