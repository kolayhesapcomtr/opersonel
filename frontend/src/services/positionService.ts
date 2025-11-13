import api from './api';
import { Position, ApiResponse } from '../types';

export const positionService = {
  async getAll(departmentId?: string): Promise<Position[]> {
    const params = departmentId ? `?departmentId=${departmentId}` : '';
    const response = await api.get<ApiResponse<Position[]>>(`/positions${params}`);
    return response.data.data!;
  },

  async getById(id: string): Promise<Position> {
    const response = await api.get<ApiResponse<Position>>(`/positions/${id}`);
    return response.data.data!;
  },

  async create(data: Partial<Position>): Promise<Position> {
    const response = await api.post<ApiResponse<Position>>('/positions', data);
    return response.data.data!;
  },

  async update(id: string, data: Partial<Position>): Promise<Position> {
    const response = await api.patch<ApiResponse<Position>>(`/positions/${id}`, data);
    return response.data.data!;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/positions/${id}`);
  },
};
