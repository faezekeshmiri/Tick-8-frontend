import { apiClient } from './client';
import type { Flashcard, FlashcardSide, PaginatedResponse } from '../types/content.types';

export interface ListFlashcardsParams {
  search?: string;
  page?: number;
  per_page?: number;
}

export interface FlashcardPayload {
  front: FlashcardSide;
  back: FlashcardSide;
}

export interface FlashcardUpdatePayload {
  front?: FlashcardSide;
  back?: FlashcardSide;
}

export interface ReorderItem {
  id: number;
  order_index: number;
}

export const listFlashcards = (subCategoryId: number, params?: ListFlashcardsParams) =>
  apiClient
    .get<PaginatedResponse<Flashcard>>(`/subcategories/${subCategoryId}/flashcards`, { params })
    .then((r) => r.data);

export const getFlashcard = (id: number) =>
  apiClient.get<Flashcard>(`/flashcards/${id}`).then((r) => r.data);

export const createFlashcard = (subCategoryId: number, data: FlashcardPayload) =>
  apiClient
    .post<Flashcard>(`/subcategories/${subCategoryId}/flashcards`, data)
    .then((r) => r.data);

export const updateFlashcard = (id: number, data: FlashcardUpdatePayload) =>
  apiClient.patch<Flashcard>(`/flashcards/${id}`, data).then((r) => r.data);

export const deleteFlashcard = (id: number) =>
  apiClient.delete(`/flashcards/${id}`);

export const reorderFlashcards = (subCategoryId: number, flashcards: ReorderItem[]) =>
  apiClient
    .post<Flashcard[]>(`/subcategories/${subCategoryId}/flashcards/reorder`, { flashcards })
    .then((r) => r.data);
