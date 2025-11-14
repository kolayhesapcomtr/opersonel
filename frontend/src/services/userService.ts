import api from './api';
import { User } from '../types';

export const userService = {
  // Get all users
  async getAll(): Promise<User[]> {
    const response = await api.get('/users');
    return response.data.data;
  },

  // Get user by ID
  async getById(id: string): Promise<User> {
    const response = await api.get(`/users/${id}`);
    return response.data.data;
  },

  // Create new user
  async create(data: Partial<User>): Promise<User> {
    const response = await api.post('/users', data);
    return response.data.data;
  },

  // Update user
  async update(id: string, data: Partial<User>): Promise<User> {
    const response = await api.put(`/users/${id}`, data);
    return response.data.data;
  },

  // Delete user
  async delete(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },

  // Get current user
  async getCurrentUser(): Promise<User> {
    const response = await api.get('/users/me');
    return response.data.data;
  },
};
