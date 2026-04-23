// ============ 通用类型 ============

export interface Role {
  id: number;
  roleCode: string;
  roleName: string;
  description?: string;
  status?: number;
  createdTime?: string;
  updatedTime?: string;
}

export interface User {
  id: number;
  username: string;
  nickname?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  status?: number;
  roles?: Role[];
  departments?: Department[];
  deptId?: number;
  deptName?: string;
  createTime?: string;
  updateTime?: string;
}

export interface Department {
  id: number;
  deptName: string;
  deptCode?: string;
  parentId?: number;
  parentName?: string;
  sortOrder?: number;
  description?: string;
  leader?: string;
  phone?: string;
  email?: string;
  sort?: number;
  status?: number;
  children?: Department[];
  createTime?: string;
  updateTime?: string;
}

// ============ 分页 ============

export interface PageData<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
  pages: number;
}

// ============ 认证相关 ============

export interface LoginDTO {
  username: string;
  password: string;
}

export interface RegisterDTO {
  username: string;
  password: string;
  nickname?: string;
  email?: string;
  phone?: string;
}

// 后端 /api/auth/login 返回结构
export interface LoginVO {
  token: string;
  username: string;
}

// ============ 流程定义 ============

export interface ProcessDefRespDTO {
  id: number;
  processKey: string;
  processName: string;
  description?: string;
  category?: string;
  version: number;
  bpmnXml?: string;
  svgXml?: string;
  status: number; // 1-激活 2-挂起
  deploymentId?: string;
  camundaProcessDefinitionId?: string;
  hasBpmnXml: boolean;
  hasSvgXml: boolean;
  createdBy?: number;
  createdTime?: string;
  updatedBy?: number;
  updatedTime?: string;
}

export interface ProcessDefCreateDTO {
  processKey: string;
  processName: string;
  description?: string;
  category?: string;
  bpmnXml?: string;
  svgXml?: string;
}

export interface ProcessDefUpdateDTO {
  processName?: string;
  description?: string;
  category?: string;
  bpmnXml?: string;
  svgXml?: string;
}

// ============ 流程实例 ============

export interface ProcessInstRespDTO {
  id: number;
  processDefId: number;
  camundaProcessInstId: string;
  businessKey?: string;
  starterId?: number;
  status: number; // 1-运行中 2-已完成 3-已取消
  camundaProcessDefId?: string;
  processDefKey?: string;
  processDefVersion?: number;
  processDefName?: string;
  createdTime?: string;
  endedTime?: string;
}

export interface ProcessInstCreateDTO {
  processDefId?: number;
  processDefKey?: string;
  processDefVersion?: number;
  businessKey?: string;
  variables?: Record<string, unknown>;
}

// ============ 任务 ============

export interface TaskRespDTO {
  camundaTaskId: string;
  taskName: string;
  taskDefinitionKey: string;
  createdTime?: string;
  dueDate?: string;
  priority: number;
  assignee?: string;
  candidateUsers?: string;
  candidateGroups?: string;
  camundaProcessInstId: string;
  processDefKey?: string;
  processDefVersion?: number;
  processDefName?: string;
  processInstBusinessKey?: string;
  status: string;
}

export interface TaskClaimDTO {
  taskId: string;
  assigneeId?: number;
}

export interface TaskCompleteDTO {
  taskId: string;
  variables?: Record<string, unknown>;
}

export interface TaskDelegateDTO {
  taskId: string;
  delegateUserId: string | number;
}

// ============ API 响应包装 ============

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// 后端 Result<T> 即 ApiResponse<T>
export type Result<T> = ApiResponse<T>;
