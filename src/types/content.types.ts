// ─── Shared ──────────────────────────────────────────────────────────────────

export type ContentType = 'text' | 'image';

export interface FlashcardSide {
  type: ContentType;
  text: string | null;
  image_url: string | null;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

// ─── Category ────────────────────────────────────────────────────────────────

export interface Category {
  id: number;
  title: string;
  description: string | null;
  subcategory_count: number;
  flashcard_count: number;
  created_at: string;
  updated_at: string;
}

// ─── SubCategory ─────────────────────────────────────────────────────────────

export interface SubCategory {
  id: number;
  category_id: number;
  title: string;
  description: string | null;
  flashcard_count: number;
  created_at: string;
  updated_at: string;
}

// ─── Flashcard ───────────────────────────────────────────────────────────────

export interface Flashcard {
  id: number;
  sub_category_id: number;
  front: FlashcardSide;
  back: FlashcardSide;
  order_index: number;
  created_at: string;
  updated_at: string;
}

// ─── Trash ───────────────────────────────────────────────────────────────────

export type TrashItemType = 'category' | 'subcategory' | 'flashcard';

export interface TrashCategory {
  id: number;
  type: 'category';
  title: string;
  description: string | null;
  deleted_at: string;
}

export interface TrashSubCategory {
  id: number;
  type: 'subcategory';
  title: string;
  description: string | null;
  category_id: number;
  deleted_at: string;
}

export interface TrashFlashcard {
  id: number;
  type: 'flashcard';
  sub_category_id: number;
  front_preview: string | null;
  deleted_at: string;
}

export interface TrashResponse {
  categories: TrashCategory[];
  subcategories: TrashSubCategory[];
  flashcards: TrashFlashcard[];
  total: number;
}
