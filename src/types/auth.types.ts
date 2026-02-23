export type UserRole = 'user' | 'admin';

export interface AuthUser {
  id: number;
  display_name: string;
  email: string;
  role: UserRole;
  is_email_verified: boolean;
  avatar_url: string | null;
  pending_email?: string | null;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  remember_me: boolean;
}

export interface RegisterPayload {
  display_name: string;
  email: string;
  password: string;
}

export interface UpdateProfilePayload {
  display_name?: string;
  avatar_url?: string;
}

export interface ChangeEmailPayload {
  new_email: string;
  current_password: string;
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
}

export interface AdminUserView {
  id: number;
  display_name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  is_email_verified: boolean;
  avatar_url: string | null;
  created_at: string;
}

export interface AdminUserListResponse {
  users: AdminUserView[];
  total: number;
  page: number;
  page_size: number;
}

export interface AdminStats {
  total_users: number;
  active_users: number;
  suspended_users: number;
  admin_count: number;
}

export interface AdminUserDetailStats {
  categories_count: number;
  subcategories_count: number;
  flashcards_count: number;
  cards_with_progress_count: number;
  total_reviews_count: number;
  progress_pending: number;
  progress_phase1: number;
  progress_phase2: number;
  progress_graduated: number;
  progress_long_term_mastered: number;
}

export interface AdminSubCategorySummary {
  id: number;
  title: string;
  flashcards_count: number;
  created_at: string;
}

export interface AdminCategorySummary {
  id: number;
  title: string;
  description: string | null;
  subcategories_count: number;
  flashcards_count: number;
  subcategories: AdminSubCategorySummary[];
  created_at: string;
}

export interface AdminUserDetail {
  user: AdminUserView;
  stats: AdminUserDetailStats;
  categories: AdminCategorySummary[];
}
