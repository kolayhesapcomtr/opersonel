import { useAuthStore } from '../store/authStore';
import { UserRole } from '../types';

export const usePermissions = () => {
  const { user } = useAuthStore();

  const isAdmin = () => {
    return user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.ADMIN;
  };

  const isHR = () => {
    return user?.role === UserRole.HR_MANAGER;
  };

  const isManager = () => {
    return user?.role === UserRole.MANAGER;
  };

  const isEmployee = () => {
    return user?.role === UserRole.EMPLOYEE;
  };

  // Check if user can create/edit/delete
  const canManage = () => {
    return isAdmin() || isHR();
  };

  // Check if user can delete
  const canDelete = () => {
    return isAdmin() || isHR();
  };

  // Check if user can edit
  const canEdit = () => {
    return isAdmin() || isHR() || isManager();
  };

  // Check if user can view only
  const isViewOnly = () => {
    return isEmployee();
  };

  // Check if user can approve leave requests
  const canApproveLeave = () => {
    return isAdmin() || isHR() || isManager();
  };

  return {
    user,
    isAdmin,
    isHR,
    isManager,
    isEmployee,
    canManage,
    canDelete,
    canEdit,
    isViewOnly,
    canApproveLeave,
  };
};
