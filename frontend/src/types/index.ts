// User & Auth
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  HR_MANAGER = 'HR_MANAGER',
  MANAGER = 'MANAGER',
  EMPLOYEE = 'EMPLOYEE',
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  tenantId: string;
  employeeId?: string;
  isActive: boolean;
  employee?: Employee;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  email?: string;
  phone?: string;
  subdomain?: string;
  customDomain?: string;
  hasSubdomain: boolean;
  hasCustomDomain: boolean;
  planType: string;
  subscriptionStatus: string;
}

export interface AuthResponse {
  user: User;
  tenant: Tenant;
  token: string;
}

// Employee
export enum EmploymentType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  INTERN = 'INTERN',
  TEMPORARY = 'TEMPORARY',
}

export enum EmploymentStatus {
  ACTIVE = 'ACTIVE',
  ON_LEAVE = 'ON_LEAVE',
  TERMINATED = 'TERMINATED',
  RESIGNED = 'RESIGNED',
  RETIRED = 'RETIRED',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
  PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY',
}

export enum MaritalStatus {
  SINGLE = 'SINGLE',
  MARRIED = 'MARRIED',
  DIVORCED = 'DIVORCED',
  WIDOWED = 'WIDOWED',
}

export interface Employee {
  id: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: Gender;
  maritalStatus?: MaritalStatus;
  nationalId?: string;
  taxId?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  employeeNumber: string;
  hireDate: string;
  terminationDate?: string;
  employmentType: EmploymentType;
  status: EmploymentStatus;
  departmentId: string;
  department?: Department;
  positionId: string;
  position?: Position;
  managerId?: string;
  manager?: Employee;
  salary?: number;
  currency?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  profilePhoto?: string;
  bio?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Department
export interface Department {
  id: string;
  tenantId: string;
  name: string;
  code?: string;
  description?: string;
  parentId?: string;
  parent?: Department;
  managerId?: string;
  manager?: Employee;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    employees?: number;
  };
}

// Position
export interface Position {
  id: string;
  tenantId: string;
  title: string;
  code?: string;
  description?: string;
  level?: string;
  departmentId: string;
  department?: Department;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Leave
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
  employee?: Employee;
  leaveTypeId: string;
  leaveType?: LeaveType;
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

// API Response
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: any[];
}
