import client from './client';
import type { ApiResponse, PageData } from '@/lib/types';

export interface Role {
  id?: number;
  roleCode: string;
  roleName: string;
  description?: string;
  status?: number;
  createdTime?: string;
  updatedTime?: string;
}

export const roleApi = {
  getRoles: async (params?: { page?: number; pageSize?: number; keyword?: string }): Promise<ApiResponse<PageData<Role>>> => {
    const resp = await client.get('/roles', { params });
    return resp.data;
  },
  createRole: async (data: Partial<Role>): Promise<ApiResponse<void>> => {
    const resp = await client.post('/roles', data);
    return resp.data;
  },
  updateRole: async (id: number, data: Partial<Role>): Promise<ApiResponse<void>> => {
    const resp = await client.put(`/roles/${id}`, data);
    return resp.data;
  },
  deleteRole: async (id: number): Promise<ApiResponse<void>> => {
    const resp = await client.delete(`/roles/${id}`);
    return resp.data;
  },
};
