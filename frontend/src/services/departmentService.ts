import api from './api';
import { Department, ApiResponse } from '../types';

export const departmentService = {
  async getAll(): Promise<Department[]> {
    const response = await api.get<ApiResponse<Department[]>>('/departments');
    return response.data.data!;
  },

  async getHierarchy(): Promise<Department[]> {
    const response = await api.get<ApiResponse<Department[]>>('/departments/hierarchy');
    return response.data.data!;
  },

  async getById(id: string): Promise<Department> {
    const response = await api.get<ApiResponse<Department>>(`/departments/${id}`);
    return response.data.data!;
  },

  async create(data: Partial<Department>): Promise<Department> {
    const response = await api.post<ApiResponse<Department>>('/departments', data);
    return response.data.data!;
  },

  async update(id: string, data: Partial<Department>): Promise<Department> {
    const response = await api.patch<ApiResponse<Department>>(`/departments/${id}`, data);
    return response.data.data!;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/departments/${id}`);
  },

  async getStats(id: string): Promise<any> {
    const response = await api.get<ApiResponse>(`/departments/${id}/stats`);
    return response.data.data;
  },
};
