import { apiClient } from './client';
import type { PaginatedResponse, SubCategory } from '../types/content.types';

export interface ListSubCategoriesParams {
  search?: string;
  page?: number;
  per_page?: number;
}

export const listSubCategories = (categoryId: number, params?: ListSubCategoriesParams) =>
  apiClient
    .get<PaginatedResponse<SubCategory>>(`/categories/${categoryId}/subcategories`, { params })
    .then((r) => r.data);

export const getSubCategory = (id: number) =>
  apiClient.get<SubCategory>(`/subcategories/${id}`).then((r) => r.data);

export const createSubCategory = (
  categoryId: number,
  data: { title: string; description?: string | null; color?: string | null },
) =>
  apiClient
    .post<SubCategory>(`/categories/${categoryId}/subcategories`, data)
    .then((r) => r.data);

export const updateSubCategory = (
  id: number,
  data: { title?: string; description?: string | null; color?: string | null },
) => apiClient.patch<SubCategory>(`/subcategories/${id}`, data).then((r) => r.data);

export const deleteSubCategory = (id: number) =>
  apiClient.delete(`/subcategories/${id}`);
