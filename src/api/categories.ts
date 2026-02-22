import { apiClient } from './client';
import type { Category, PaginatedResponse } from '../types/content.types';

export interface ListCategoriesParams {
  search?: string;
  page?: number;
  per_page?: number;
}

export const listCategories = (params?: ListCategoriesParams) =>
  apiClient.get<PaginatedResponse<Category>>('/categories', { params }).then((r) => r.data);

export const getCategory = (id: number) =>
  apiClient.get<Category>(`/categories/${id}`).then((r) => r.data);

export const createCategory = (data: { title: string; description?: string | null }) =>
  apiClient.post<Category>('/categories', data).then((r) => r.data);

export const updateCategory = (
  id: number,
  data: { title?: string; description?: string | null },
) => apiClient.patch<Category>(`/categories/${id}`, data).then((r) => r.data);

export const deleteCategory = (id: number) =>
  apiClient.delete(`/categories/${id}`);
