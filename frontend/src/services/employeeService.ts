import api from './api';
import { Employee, ApiResponse, EmploymentStatus, EmploymentType } from '../types';

export interface EmployeeFilters {
  departmentId?: string;
  positionId?: string;
  status?: EmploymentStatus;
  employmentType?: EmploymentType;
  search?: string;
}

export const employeeService = {
  async getAll(filters?: EmployeeFilters): Promise<Employee[]> {
    const params = new URLSearchParams();
    if (filters?.departmentId) params.append('departmentId', filters.departmentId);
    if (filters?.positionId) params.append('positionId', filters.positionId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.employmentType) params.append('employmentType', filters.employmentType);
    if (filters?.search) params.append('search', filters.search);

    const response = await api.get<ApiResponse<Employee[]>>(`/employees?${params.toString()}`);
    return response.data.data!;
  },

  async getById(id: string): Promise<Employee> {
    const response = await api.get<ApiResponse<Employee>>(`/employees/${id}`);
    return response.data.data!;
  },

  async create(data: Partial<Employee>): Promise<Employee> {
    const response = await api.post<ApiResponse<Employee>>('/employees', data);
    return response.data.data!;
  },

  async update(id: string, data: Partial<Employee>): Promise<Employee> {
    const response = await api.patch<ApiResponse<Employee>>(`/employees/${id}`, data);
    return response.data.data!;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/employees/${id}`);
  },

  async terminate(id: string, terminationDate: string, reason?: string): Promise<Employee> {
    const response = await api.post<ApiResponse<Employee>>(`/employees/${id}/terminate`, {
      terminationDate,
      reason,
    });
    return response.data.data!;
  },

  async getStats(): Promise<any> {
    const response = await api.get<ApiResponse>('/employees/stats');
    return response.data.data;
  },
};
