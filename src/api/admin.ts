import type {
  Category,
  Flashcard,
  FlashcardSide,
  PaginatedResponse,
  SubCategory,
} from '../types/content.types';
import {
  AdminStats,
  AdminUserDetail,
  AdminUserListResponse,
  AdminUserView,
} from '../types/auth.types';
import { apiClient } from './client';

const adminUser = (userId: number) => `/admin/users/${userId}`;

export async function getAdminStats(): Promise<AdminStats> {
  const { data } = await apiClient.get<AdminStats>('/admin/stats');
  return data;
}

export async function getUserDetail(userId: number): Promise<AdminUserDetail> {
  const { data } = await apiClient.get<AdminUserDetail>(`/admin/users/${userId}`);
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

// ─── Admin: manage a user's content (categories, subcategories, flashcards) ───

export interface AdminListParams {
  search?: string;
  page?: number;
  per_page?: number;
}

export function adminListCategories(userId: number, params?: AdminListParams) {
  return apiClient
    .get<PaginatedResponse<Category>>(`${adminUser(userId)}/categories`, { params })
    .then((r) => r.data);
}

export function adminGetCategory(userId: number, categoryId: number) {
  return apiClient.get<Category>(`${adminUser(userId)}/categories/${categoryId}`).then((r) => r.data);
}

export function adminCreateCategory(
  userId: number,
  data: { title: string; description?: string | null },
) {
  return apiClient
    .post<Category>(`${adminUser(userId)}/categories`, data)
    .then((r) => r.data);
}

export function adminUpdateCategory(
  userId: number,
  categoryId: number,
  data: { title?: string; description?: string | null },
) {
  return apiClient
    .patch<Category>(`${adminUser(userId)}/categories/${categoryId}`, data)
    .then((r) => r.data);
}

export function adminDeleteCategory(userId: number, categoryId: number) {
  return apiClient.delete(`${adminUser(userId)}/categories/${categoryId}`);
}

export function adminListSubCategories(
  userId: number,
  categoryId: number,
  params?: AdminListParams,
) {
  return apiClient
    .get<PaginatedResponse<SubCategory>>(
      `${adminUser(userId)}/categories/${categoryId}/subcategories`,
      { params },
    )
    .then((r) => r.data);
}

export function adminGetSubCategory(userId: number, subId: number) {
  return apiClient.get<SubCategory>(`${adminUser(userId)}/subcategories/${subId}`).then((r) => r.data);
}

export function adminCreateSubCategory(
  userId: number,
  categoryId: number,
  data: { title: string; description?: string | null; color?: string | null },
) {
  return apiClient
    .post<SubCategory>(
      `${adminUser(userId)}/categories/${categoryId}/subcategories`,
      data,
    )
    .then((r) => r.data);
}

export function adminUpdateSubCategory(
  userId: number,
  subId: number,
  data: { title?: string; description?: string | null; color?: string | null },
) {
  return apiClient
    .patch<SubCategory>(`${adminUser(userId)}/subcategories/${subId}`, data)
    .then((r) => r.data);
}

export function adminDeleteSubCategory(userId: number, subId: number) {
  return apiClient.delete(`${adminUser(userId)}/subcategories/${subId}`);
}

export function adminListFlashcards(
  userId: number,
  subCategoryId: number,
  params?: AdminListParams,
) {
  return apiClient
    .get<PaginatedResponse<Flashcard>>(
      `${adminUser(userId)}/subcategories/${subCategoryId}/flashcards`,
      { params },
    )
    .then((r) => r.data);
}

export function adminGetFlashcard(userId: number, cardId: number) {
  return apiClient.get<Flashcard>(`${adminUser(userId)}/flashcards/${cardId}`).then((r) => r.data);
}

export function adminCreateFlashcard(
  userId: number,
  subCategoryId: number,
  data: { front: FlashcardSide; back: FlashcardSide },
) {
  return apiClient
    .post<Flashcard>(
      `${adminUser(userId)}/subcategories/${subCategoryId}/flashcards`,
      data,
    )
    .then((r) => r.data);
}

export function adminUpdateFlashcard(
  userId: number,
  cardId: number,
  data: { front?: FlashcardSide; back?: FlashcardSide },
) {
  return apiClient
    .patch<Flashcard>(`${adminUser(userId)}/flashcards/${cardId}`, data)
    .then((r) => r.data);
}

export function adminDeleteFlashcard(userId: number, cardId: number) {
  return apiClient.delete(`${adminUser(userId)}/flashcards/${cardId}`);
}

export function adminReorderFlashcards(
  userId: number,
  subCategoryId: number,
  flashcards: { id: number; order_index: number }[],
) {
  return apiClient
    .post<Flashcard[]>(
      `${adminUser(userId)}/subcategories/${subCategoryId}/flashcards/reorder`,
      { flashcards },
    )
    .then((r) => r.data);
}
