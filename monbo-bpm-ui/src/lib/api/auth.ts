import client from './client';
import type { LoginDTO, RegisterDTO, LoginVO, User } from '@/lib/types';
import type { Result } from '@/lib/types';

export const authApi = {
  login: async (data: LoginDTO): Promise<LoginVO> => {
    const resp = await client.post<Result<LoginVO>>('/auth/login', data);
    if (resp.data.code !== 200) {
      throw new Error(resp.data.message || '登录失败');
    }
    return resp.data.data;
  },

  register: async (data: RegisterDTO): Promise<void> => {
    const resp = await client.post<Result<void>>('/auth/register', data);
    if (resp.data.code !== 200) {
      throw new Error(resp.data.message || '注册失败');
    }
  },

  getCurrentUser: async (): Promise<User> => {
    const resp = await client.get<Result<User>>('/auth/me');
    if (resp.data.code !== 200) {
      throw new Error(resp.data.message || '获取用户信息失败');
    }
    return resp.data.data;
  },
};
