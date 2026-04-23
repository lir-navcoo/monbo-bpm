import client from './client';
import type { TaskRespDTO, TaskClaimDTO, TaskCompleteDTO, TaskDelegateDTO } from '@/lib/types';
import type { Result } from '@/lib/types';

export const taskApi = {
  listMy: async (userId?: number): Promise<TaskRespDTO[]> => {
    const params = userId !== undefined ? { userId } : {};
    const resp = await client.get<Result<TaskRespDTO[]>>('/tasks/my', { params });
    return resp.data.data ?? [];
  },

  getById: async (taskId: string): Promise<TaskRespDTO> => {
    const resp = await client.get<Result<TaskRespDTO>>(`/tasks/${taskId}`);
    return resp.data.data;
  },

  claim: async (data: TaskClaimDTO): Promise<void> => {
    const resp = await client.post<Result<void>>('/tasks/claim', data);
    if (resp.data.code !== 200) throw new Error(resp.data.message);
  },

  unclaim: async (taskId: string): Promise<void> => {
    const resp = await client.post<Result<void>>('/tasks/unclaim', { taskId });
    if (resp.data.code !== 200) throw new Error(resp.data.message);
  },

  complete: async (data: TaskCompleteDTO): Promise<void> => {
    const resp = await client.post<Result<void>>('/tasks/complete', data);
    if (resp.data.code !== 200) throw new Error(resp.data.message);
  },

  delegate: async (data: TaskDelegateDTO): Promise<void> => {
    const resp = await client.post<Result<void>>('/tasks/delegate', data);
    if (resp.data.code !== 200) throw new Error(resp.data.message);
  },

  listClaimable: async (userId?: number): Promise<TaskRespDTO[]> => {
    const params = userId !== undefined ? { userId } : {};
    const resp = await client.get<Result<TaskRespDTO[]>>('/tasks/claimable', { params });
    return resp.data.data ?? [];
  },

  listHistory: async (userId?: number): Promise<TaskRespDTO[]> => {
    const params = userId !== undefined ? { userId } : {};
    const resp = await client.get<Result<TaskRespDTO[]>>('/tasks/history', { params });
    return resp.data.data ?? [];
  },
};
