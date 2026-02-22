import { apiClient, BASE_URL } from './client';

export interface ImageUploadResponse {
  url: string;
}

export const uploadImage = async (file: File): Promise<ImageUploadResponse> => {
  const form = new FormData();
  form.append('file', file);
  const res = await apiClient.post<ImageUploadResponse>('/upload/image', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

/** Converts a relative upload path (e.g. /uploads/1/abc.jpg) to a full URL. */
export const resolveImageUrl = (path: string): string => {
  if (path.startsWith('http')) return path;
  const base = BASE_URL.replace('/api/v1', '');
  return `${base}${path}`;
};
