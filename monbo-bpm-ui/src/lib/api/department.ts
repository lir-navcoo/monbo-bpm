import client from './client';
import type { ApiResponse, Result } from '@/lib/types';

export interface DepartmentNode {
  id: number;
  parentId: number;
  deptName: string;
  deptCode: string;
  leader?: string;
  phone?: string;
  email?: string;
  sortOrder: number;
  sort?: number; // for backward compatibility
  status: number;
  createdTime?: string;
  updatedTime?: string;
  children?: DepartmentNode[];
}

export type Department = DepartmentNode;

export const departmentApi = {
  list: async (): Promise<DepartmentNode[]> => {
    const resp = await client.get<Result<DepartmentNode[]>>('/departments');
    return resp.data.data || [];
  },
  getDepartments: async (): Promise<ApiResponse<Department[]>> => {
    const resp = await client.get('/departments');
    return resp.data;
  },
  createDepartment: async (data: Partial<Department>): Promise<ApiResponse<void>> => {
    const resp = await client.post('/departments', data);
    return resp.data;
  },
  updateDepartment: async (id: number, data: Partial<Department>): Promise<ApiResponse<void>> => {
    const resp = await client.put(`/departments/${id}`, data);
    return resp.data;
  },
  deleteDepartment: async (id: number): Promise<ApiResponse<void>> => {
    const resp = await client.delete(`/departments/${id}`);
    return resp.data;
  },
};
