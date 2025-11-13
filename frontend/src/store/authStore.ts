import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Tenant } from '../types';

interface AuthState {
  user: User | null;
  tenant: Tenant | null;
  token: string | null;
  isAuthenticated: boolean;

  // Actions
  setAuth: (user: User, tenant: Tenant, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tenant: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, tenant, token) => {
        // Store in localStorage for axios interceptor
        localStorage.setItem('token', token);
        localStorage.setItem('tenantId', tenant.id);
        localStorage.setItem('user', JSON.stringify(user));

        set({
          user,
          tenant,
          token,
          isAuthenticated: true,
        });
      },

      logout: () => {
        // Clear localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('tenantId');
        localStorage.removeItem('user');

        set({
          user: null,
          tenant: null,
          token: null,
          isAuthenticated: false,
        });
      },

      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
    }),
    {
      name: 'auth-storage',
    }
  )
);
