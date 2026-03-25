export interface QueueItem {
  progress_id: number;
  flashcard_id: number;
  phase: number;
  tick_in_phase: number;
  is_overdue: boolean;
  catch_up_n: number;
  catch_up_total: number;
}

export interface TodaysQueueResponse {
  queue: QueueItem[];
  total_due: number;
  capped: boolean;
  session_cap: number;
  daily_new_card_limit: number;
}

export interface FlashcardSideContent {
  type: string;
  text: string | null;
  image_url: string | null;
}

export interface QueueItemWithCard {
  progress_id: number;
  flashcard_id: number;
  subcategory_color: string;
  front: FlashcardSideContent;
  back: FlashcardSideContent;
  marks: TickMark[];
}

export interface UpcomingDay {
  date: string;
  count: number;
}

export interface NextReviewDateResponse {
  date: string | null;
}

export interface StudyCardSideResponse {
  type: string;
  text: string | null;
  image_url: string | null;
}

export interface StudyCardResponse {
  progress_id: number;
  flashcard_id: number;
  phase: number;
  tick_in_phase: number;
  catch_up_n: number;
  catch_up_total: number;
  side: 'front' | 'back';
  content: StudyCardSideResponse;
  content_hidden: StudyCardSideResponse;
  hidden_side_label: string;
  subcategory_color: string;
}

export interface RecordTickResponse {
  progress_id: number;
  phase: number;
  tick_in_phase: number;
  result: string;
  phase2_regression_offer: boolean;
}

export interface UserStudySettingsResponse {
  daily_new_card_limit: number;
  session_cap: number;
  phase_regression_enabled: boolean;
  skip_off_schedule_progress_prompt: boolean;
}

export interface SubcategoryProgressResponse {
  total: number;
  pending: number;
  phase1: number;
  phase2: number;
  graduated: number;
  long_term_mastered: number;
  mastery_percent: number;
}

export type TickMark = 'remembered' | 'forgot';

export interface CardProgressItem {
  flashcard_id: number;
  progress_id: number;
  marks: TickMark[];
}

export interface SubcategoryCardProgressResponse {
  card_progress: CardProgressItem[];
}
