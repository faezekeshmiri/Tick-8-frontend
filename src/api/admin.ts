import { AdminStats, AdminUserListResponse, AdminUserView } from '../types/auth.types';
import { apiClient } from './client';

export async function getAdminStats(): Promise<AdminStats> {
  const { data } = await apiClient.get<AdminStats>('/admin/stats');
  return data;
}

export async function listUsers(params: {
  search?: string;
  role?: 'user' | 'admin';
  is_active?: boolean;
  page?: number;
  page_size?: number;
}): Promise<AdminUserListResponse> {
  const { data } = await apiClient.get<AdminUserListResponse>('/admin/users', { params });
  return data;
}

export async function suspendUser(userId: number): Promise<AdminUserView> {
  const { data } = await apiClient.patch<AdminUserView>(`/admin/users/${userId}/suspend`);
  return data;
}

export async function reactivateUser(userId: number): Promise<AdminUserView> {
  const { data } = await apiClient.patch<AdminUserView>(`/admin/users/${userId}/reactivate`);
  return data;
}

export async function makeAdmin(userId: number): Promise<AdminUserView> {
  const { data } = await apiClient.patch<AdminUserView>(`/admin/users/${userId}/make-admin`);
  return data;
}

export async function removeAdmin(userId: number): Promise<AdminUserView> {
  const { data } = await apiClient.patch<AdminUserView>(`/admin/users/${userId}/remove-admin`);
  return data;
}
