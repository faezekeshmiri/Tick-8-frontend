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
