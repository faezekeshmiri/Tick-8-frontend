import { apiClient } from './client';
import type {
  NextReviewDateResponse,
  QueueItemWithCard,
  RecordTickResponse,
  StudyCardResponse,
  SubcategoryCardProgressResponse,
  SubcategoryProgressResponse,
  TodaysQueueResponse,
  UpcomingDay,
  UserStudySettingsResponse,
} from '../types/study.types';

export const getTodaysQueue = () =>
  apiClient.get<TodaysQueueResponse>('/study/queue').then((r) => r.data);

export const getUpcomingReviews = (days = 5) =>
  apiClient.get<UpcomingDay[]>(`/study/upcoming?days=${days}`).then((r) => r.data);

export const getNextReviewDate = () =>
  apiClient.get<NextReviewDateResponse>('/study/next-review-date').then((r) => r.data);

export const getStudyCard = (
  progressId: number,
  params?: { tick_in_phase?: number; catch_up_n?: number; catch_up_total?: number }
) => {
  const search = new URLSearchParams();
  if (params?.tick_in_phase != null) search.set('tick_in_phase', String(params.tick_in_phase));
  if (params?.catch_up_n != null) search.set('catch_up_n', String(params.catch_up_n));
  if (params?.catch_up_total != null) search.set('catch_up_total', String(params.catch_up_total));
  const q = search.toString() ? `?${search}` : '';
  return apiClient.get<StudyCardResponse>(`/study/card/${progressId}${q}`).then((r) => r.data);
};

export const recordTick = (
  progressId: number,
  body: { result: 'remembered' | 'forgot'; response_time_ms?: number }
) =>
  apiClient
    .post<RecordTickResponse>(`/study/progress/${progressId}/tick`, body)
    .then((r) => r.data);

export const setProgressTicks = (progressId: number, marks: ('remembered' | 'forgot')[]) =>
  apiClient
    .put(`/study/progress/${progressId}/ticks`, { marks })
    .then((r) => r.data);

export const getTodaysQueueWithCards = () =>
  apiClient.get<QueueItemWithCard[]>('/study/queue/with-cards').then((r) => r.data);

export const initializeSubcategory = (subId: number) =>
  apiClient.post(`/study/subcategories/${subId}/initialize`).then((r) => r.data);

export const getStudySettings = () =>
  apiClient.get<UserStudySettingsResponse>('/users/me/study-settings').then((r) => r.data);

export const updateStudySettings = (data: {
  daily_new_card_limit?: number;
  session_cap?: number;
  phase_regression_enabled?: boolean;
  skip_off_schedule_progress_prompt?: boolean;
}) =>
  apiClient
    .patch<UserStudySettingsResponse>('/users/me/study-settings', data)
    .then((r) => r.data);

export const getSubcategoryProgress = (subId: number) =>
  apiClient
    .get<SubcategoryProgressResponse>(`/subcategories/${subId}/progress`)
    .then((r) => r.data);

export const getSubcategoryCardProgress = (subId: number) =>
  apiClient
    .get<SubcategoryCardProgressResponse>(`/subcategories/${subId}/card-progress`)
    .then((r) => r.data);
