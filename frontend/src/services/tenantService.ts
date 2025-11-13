import api from './api';
import { Tenant, ApiResponse } from '../types';

export const tenantService = {
  async getAll(): Promise<Tenant[]> {
    const response = await api.get<ApiResponse<Tenant[]>>('/tenants');
    return response.data.data!;
  },

  async getCurrent(): Promise<any> {
    const response = await api.get<ApiResponse>('/tenants/current');
    return response.data.data;
  },

  async getBySlug(slug: string): Promise<Tenant> {
    const response = await api.get<ApiResponse<Tenant>>(`/tenants/slug/${slug}`);
    return response.data.data!;
  },

  async checkSubdomain(subdomain: string): Promise<{ available: boolean; subdomain: string }> {
    const response = await api.get<ApiResponse>(`/tenants/check-subdomain/${subdomain}`);
    return response.data.data;
  },

  async create(data: Partial<Tenant>): Promise<Tenant> {
    const response = await api.post<ApiResponse<Tenant>>('/tenants', data);
    return response.data.data!;
  },

  async update(id: string, data: Partial<Tenant>): Promise<Tenant> {
    const response = await api.patch<ApiResponse<Tenant>>(`/tenants/${id}`, data);
    return response.data.data!;
  },

  async getStats(id: string): Promise<any> {
    const response = await api.get<ApiResponse>(`/tenants/stats/${id}`);
    return response.data.data;
  },
};
