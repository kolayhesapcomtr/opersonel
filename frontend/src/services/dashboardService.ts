import api from './api';
import { ApiResponse } from '../types';

export interface DashboardOverview {
  totalEmployees: number;
  activeEmployees: number;
  onLeaveEmployees: number;
  totalDepartments: number;
  totalPositions: number;
  recentHires: number;
}

export interface EmployeeByDepartment {
  departmentId: string;
  departmentName: string;
  count: number;
}

export interface EmployeeByType {
  type: string;
  count: number;
}

export interface RecentEmployee {
  id: string;
  firstName: string;
  lastName: string;
  employeeNumber: string;
  hireDate: string;
  department: {
    name: string;
  };
  position: {
    title: string;
  };
}

export interface DashboardStats {
  overview: DashboardOverview;
  employeesByDepartment: EmployeeByDepartment[];
  employeesByType: EmployeeByType[];
  recentEmployees: RecentEmployee[];
}

export const dashboardService = {
  async getOverview(): Promise<DashboardStats> {
    const response = await api.get<ApiResponse<DashboardStats>>('/dashboard/overview');
    return response.data.data!;
  },
};
