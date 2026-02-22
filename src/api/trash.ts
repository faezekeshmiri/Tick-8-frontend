import { apiClient } from './client';
import type { TrashItemType, TrashResponse } from '../types/content.types';

export const listTrash = () =>
  apiClient.get<TrashResponse>('/trash').then((r) => r.data);

export const restoreItem = (type: TrashItemType, id: number) =>
  apiClient.post(`/trash/restore/${type}/${id}`);
