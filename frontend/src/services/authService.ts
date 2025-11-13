import api from './api';
import { AuthResponse, ApiResponse } from '../types';

export interface LoginData {
  email: string;
  password: string;
  tenantSlug: string;
}

export interface RegisterData {
  email: string;
  password: string;
  tenantSlug: string;
  firstName?: string;
  lastName?: string;
}

export const authService = {
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', data);
    return response.data.data!;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return response.data.data!;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async getProfile(): Promise<any> {
    const response = await api.get<ApiResponse>('/auth/profile');
    return response.data.data;
  },

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await api.post('/auth/change-password', { oldPassword, newPassword });
  },
};
