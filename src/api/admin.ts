import { AdminUserListResponse, AdminUserView } from '../types/auth.types';
import { apiClient } from './client';

export async function listUsers(params: {
  search?: string;
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
