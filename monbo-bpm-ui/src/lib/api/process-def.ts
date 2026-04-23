import client from './client';
import type { ProcessDefRespDTO, ProcessDefCreateDTO, ProcessDefUpdateDTO } from '@/lib/types';
import type { Result } from '@/lib/types';

export const processDefApi = {
  list: async (category?: string): Promise<ProcessDefRespDTO[]> => {
    const params = category ? { category } : {};
    const resp = await client.get<Result<ProcessDefRespDTO[]>>('/process-defs', { params });
    return resp.data.data ?? [];
  },

  getById: async (id: number): Promise<ProcessDefRespDTO> => {
    const resp = await client.get<Result<ProcessDefRespDTO>>(`/process-defs/${id}`);
    return resp.data.data;
  },

  getByKey: async (processKey: string, version?: number): Promise<ProcessDefRespDTO> => {
    const params = version !== undefined ? { version } : {};
    const resp = await client.get<Result<ProcessDefRespDTO>>(`/process-defs/key/${processKey}`, { params });
    return resp.data.data;
  },

  create: async (data: ProcessDefCreateDTO): Promise<number> => {
    const resp = await client.post<Result<number>>('/process-defs', data);
    return resp.data.data;
  },

  update: async (id: number, data: ProcessDefUpdateDTO): Promise<void> => {
    const resp = await client.put<Result<void>>(`/process-defs/${id}`, data);
    if (resp.data.code !== 200) throw new Error(resp.data.message);
  },

  redeploy: async (id: number, bpmnXml: string, svgXml?: string): Promise<number> => {
    const resp = await client.post<Result<number>>(`/process-defs/${id}/redeploy`, { bpmnXml, svgXml });
    return resp.data.data;
  },

  activate: async (id: number): Promise<void> => {
    const resp = await client.put<Result<void>>(`/process-defs/${id}/activate`);
    if (resp.data.code !== 200) throw new Error(resp.data.message);
  },

  suspend: async (id: number): Promise<void> => {
    const resp = await client.put<Result<void>>(`/process-defs/${id}/suspend`);
    if (resp.data.code !== 200) throw new Error(resp.data.message);
  },

  remove: async (id: number): Promise<void> => {
    const resp = await client.delete<Result<void>>(`/process-defs/${id}`);
    if (resp.data.code !== 200) throw new Error(resp.data.message);
  },
};
