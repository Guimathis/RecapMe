import { MediaType } from './media';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  feedback?: 'POSITIVE' | 'NEGATIVE';
}

export interface ChatStreamRequest {
  externalId: string;
  mediaType: MediaType;
  title: string;
  message: string;
  seasonCutoff: number;
  episodeCutoff: number;
  history?: Array<{ role: string; content: string }>;
}

export interface FeedbackRequest {
  mediaId?: string;
  contextType: string;
  rating: 'POSITIVE' | 'NEGATIVE';
  comment?: string;
}
