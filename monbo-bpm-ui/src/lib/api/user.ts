import client from './client';
import type { User } from '@/lib/types';
import type { ApiResponse } from '@/lib/types';

export interface PageData<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
  pages: number;
}

export interface UserCreateDTO {
  username: string;
  password?: string;
  email?: string;
  phone?: string;
  deptId?: number;
}

export interface UserUpdateDTO {
  username?: string;
  password?: string;
  email?: string;
  phone?: string;
  status?: number;
  deptId?: number;
}

export const userApi = {
  getUsers: async (params?: {
    page?: number;
    pageSize?: number;
    keyword?: string;
    deptId?: number;
  }): Promise<ApiResponse<PageData<User>>> => {
    const resp = await client.get<ApiResponse<PageData<User>>>('/users', { params });
    return resp.data;
  },

  createUser: async (data: UserCreateDTO): Promise<ApiResponse<void>> => {
    const resp = await client.post<ApiResponse<void>>('/users', data);
    return resp.data;
  },

  updateUser: async (id: number, data: UserUpdateDTO): Promise<ApiResponse<void>> => {
    const resp = await client.put<ApiResponse<void>>(`/users/${id}`, data);
    return resp.data;
  },

  deleteUser: async (id: number): Promise<ApiResponse<void>> => {
    const resp = await client.delete<ApiResponse<void>>(`/users/${id}`);
    return resp.data;
  },
};
