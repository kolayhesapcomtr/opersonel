import api from './api';
import { ApiResponse } from '../types';

export interface LeaveType {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  description?: string;
  daysPerYear: number;
  requiresApproval: boolean;
  isPaid: boolean;
  canCarryForward: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum LeaveRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export interface LeaveRequest {
  id: string;
  tenantId: string;
  employeeId: string;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    employeeNumber: string;
    department?: { name: string };
    position?: { title: string };
  };
  leaveTypeId: string;
  leaveType?: {
    id: string;
    name: string;
    code: string;
    isPaid: boolean;
  };
  startDate: string;
  endDate: string;
  days: number;
  reason?: string;
  status: LeaveRequestStatus;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveBalance {
  leaveType: {
    id: string;
    name: string;
    code: string;
    daysPerYear: number;
  };
  allocated: number;
  used: number;
  available: number;
}

export const leaveTypeService = {
  async getAll(): Promise<LeaveType[]> {
    const response = await api.get<ApiResponse<LeaveType[]>>('/leave/types');
    return response.data.data!;
  },

  async getById(id: string): Promise<LeaveType> {
    const response = await api.get<ApiResponse<LeaveType>>(`/leave/types/${id}`);
    return response.data.data!;
  },

  async create(data: Partial<LeaveType>): Promise<LeaveType> {
    const response = await api.post<ApiResponse<LeaveType>>('/leave/types', data);
    return response.data.data!;
  },

  async update(id: string, data: Partial<LeaveType>): Promise<LeaveType> {
    const response = await api.patch<ApiResponse<LeaveType>>(`/leave/types/${id}`, data);
    return response.data.data!;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/leave/types/${id}`);
  },
};

export interface LeaveRequestFilters {
  employeeId?: string;
  leaveTypeId?: string;
  status?: LeaveRequestStatus;
  startDate?: string;
  endDate?: string;
}

export const leaveRequestService = {
  async getAll(filters?: LeaveRequestFilters): Promise<LeaveRequest[]> {
    const params = new URLSearchParams();
    if (filters?.employeeId) params.append('employeeId', filters.employeeId);
    if (filters?.leaveTypeId) params.append('leaveTypeId', filters.leaveTypeId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const response = await api.get<ApiResponse<LeaveRequest[]>>(
      `/leave/requests?${params.toString()}`
    );
    return response.data.data!;
  },

  async getById(id: string): Promise<LeaveRequest> {
    const response = await api.get<ApiResponse<LeaveRequest>>(`/leave/requests/${id}`);
    return response.data.data!;
  },

  async create(data: Partial<LeaveRequest>): Promise<LeaveRequest> {
    const response = await api.post<ApiResponse<LeaveRequest>>('/leave/requests', data);
    return response.data.data!;
  },

  async update(id: string, data: Partial<LeaveRequest>): Promise<LeaveRequest> {
    const response = await api.patch<ApiResponse<LeaveRequest>>(`/leave/requests/${id}`, data);
    return response.data.data!;
  },

  async approve(id: string): Promise<LeaveRequest> {
    const response = await api.post<ApiResponse<LeaveRequest>>(`/leave/requests/${id}/approve`);
    return response.data.data!;
  },

  async reject(id: string, rejectionReason?: string): Promise<LeaveRequest> {
    const response = await api.post<ApiResponse<LeaveRequest>>(`/leave/requests/${id}/reject`, {
      rejectionReason,
    });
    return response.data.data!;
  },

  async cancel(id: string): Promise<LeaveRequest> {
    const response = await api.post<ApiResponse<LeaveRequest>>(`/leave/requests/${id}/cancel`);
    return response.data.data!;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/leave/requests/${id}`);
  },

  async getBalance(employeeId: string, leaveTypeId?: string): Promise<LeaveBalance[]> {
    const params = leaveTypeId ? `?leaveTypeId=${leaveTypeId}` : '';
    const response = await api.get<ApiResponse<LeaveBalance[]>>(
      `/leave/balance/${employeeId}${params}`
    );
    return response.data.data!;
  },
};
