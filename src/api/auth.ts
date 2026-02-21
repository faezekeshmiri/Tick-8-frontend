import {
  AuthUser,
  ChangeEmailPayload,
  ChangePasswordPayload,
  LoginPayload,
  RegisterPayload,
  TokenResponse,
  UpdateProfilePayload,
} from '../types/auth.types';
import { apiClient, BASE_URL, setAccessToken } from './client';
import axios from 'axios';

export async function register(payload: RegisterPayload): Promise<{ user: AuthUser; access_token: string }> {
  const { data } = await apiClient.post<TokenResponse>('/auth/register', payload);
  setAccessToken(data.access_token);
  const user = await getMe();
  return { user, access_token: data.access_token };
}

export async function login(payload: LoginPayload): Promise<{ user: AuthUser; access_token: string }> {
  const { data } = await apiClient.post<TokenResponse>('/auth/login', payload);
  setAccessToken(data.access_token);
  const user = await getMe();
  return { user, access_token: data.access_token };
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post('/auth/logout');
  } finally {
    setAccessToken(null);
  }
}

export async function refreshToken(): Promise<AuthUser> {
  const { data } = await axios.post<TokenResponse>(
    `${BASE_URL}/auth/refresh`,
    {},
    { withCredentials: true }
  );
  setAccessToken(data.access_token);
  return getMe();
}

export async function getMe(): Promise<AuthUser> {
  const { data } = await apiClient.get<AuthUser>('/auth/me');
  return data;
}

export async function forgotPassword(email: string): Promise<string> {
  const { data } = await apiClient.post<{ message: string }>('/auth/forgot-password', { email });
  return data.message;
}

export async function resetPassword(token: string, new_password: string): Promise<string> {
  const { data } = await apiClient.post<{ message: string }>('/auth/reset-password', {
    token,
    new_password,
  });
  return data.message;
}

export async function verifyEmail(token: string): Promise<string> {
  const { data } = await apiClient.post<{ message: string }>('/auth/verify-email', { token });
  return data.message;
}

export async function resendVerification(): Promise<string> {
  const { data } = await apiClient.post<{ message: string }>('/auth/resend-verification');
  return data.message;
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<AuthUser> {
  const { data } = await apiClient.patch<AuthUser>('/users/me', payload);
  return data;
}

export async function changeEmail(payload: ChangeEmailPayload): Promise<string> {
  const { data } = await apiClient.post<{ message: string }>('/users/me/change-email', payload);
  return data.message;
}

export async function changePassword(payload: ChangePasswordPayload): Promise<string> {
  const { data } = await apiClient.post<{ message: string }>('/users/me/change-password', payload);
  return data.message;
}
