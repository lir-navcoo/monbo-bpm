import client from './client';
import type { ProcessInstRespDTO, ProcessInstCreateDTO } from '@/lib/types';
import type { Result } from '@/lib/types';

export const processInstApi = {
  start: async (data: ProcessInstCreateDTO): Promise<number> => {
    const resp = await client.post<Result<number>>('/process-insts', data);
    return resp.data.data;
  },

  getById: async (id: number): Promise<ProcessInstRespDTO> => {
    const resp = await client.get<Result<ProcessInstRespDTO>>(`/process-insts/${id}`);
    return resp.data.data;
  },

  listMy: async (): Promise<ProcessInstRespDTO[]> => {
    const resp = await client.get<Result<ProcessInstRespDTO[]>>('/process-insts/my');
    return resp.data.data ?? [];
  },

  listByProcessDef: async (processDefId: number): Promise<ProcessInstRespDTO[]> => {
    const resp = await client.get<Result<ProcessInstRespDTO[]>>(`/process-insts/process-def/${processDefId}`);
    return resp.data.data ?? [];
  },

  getByBusinessKey: async (businessKey: string): Promise<ProcessInstRespDTO> => {
    const resp = await client.get<Result<ProcessInstRespDTO>>(`/process-insts/by-key/${businessKey}`);
    return resp.data.data;
  },

  cancel: async (id: number): Promise<void> => {
    const resp = await client.put<Result<void>>(`/process-insts/${id}/cancel`);
    if (resp.data.code !== 200) throw new Error(resp.data.message);
  },
};
