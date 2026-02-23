/**
 * Central query keys for React Query.
 * Use these for invalidateQueries / queryKey so cache stays consistent.
 */
export const queryKeys = {
  categories: (search?: string, page?: number) => ['categories', search ?? '', page ?? 1] as const,
  category: (id: number) => ['categories', id] as const,
  subcategories: (categoryId: number, search?: string, page?: number) =>
    ['subcategories', categoryId, search ?? '', page ?? 1] as const,
  subcategory: (id: number) => ['subcategories', id] as const,
  flashcards: (subCategoryId: number, search?: string, page?: number) =>
    ['flashcards', subCategoryId, search ?? '', page ?? 1] as const,
  trash: () => ['trash'] as const,
  studyQueue: () => ['study', 'queue'] as const,
  studyQueueWithCards: () => ['study', 'queue', 'with-cards'] as const,
  studyUpcoming: (days?: number) => ['study', 'upcoming', days ?? 5] as const,
  studyNextReviewDate: () => ['study', 'next-review-date'] as const,
  studySettings: () => ['study', 'settings'] as const,
  subcategoryProgress: (subId: number) => ['subcategories', subId, 'progress'] as const,
  subcategoryCardProgress: (subId: number) => ['subcategories', subId, 'card-progress'] as const,
  adminStats: () => ['admin', 'stats'] as const,
  adminUsers: (search?: string, role?: string, status?: string, page?: number) =>
    ['admin', 'users', search ?? '', role ?? '', status ?? '', page ?? 1] as const,
};
