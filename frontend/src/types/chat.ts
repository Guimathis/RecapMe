import { MediaType } from './media';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  feedback?: 'POSITIVE' | 'NEGATIVE';
}

export interface ChatStreamRequest {
  mediaId: string;
  userMessage: string;
  upToSeasonNumber?: number;
  upToEpisodeNumber?: number;
  mediaType?: MediaType;
  title?: string;
  seasonCutoff?: number;
  episodeCutoff?: number;
  history?: Array<{ role: string; content: string }>;
}

export interface FeedbackRequest {
  mediaId?: string;
  contextType: string;
  rating: 'POSITIVE' | 'NEGATIVE';
  comment?: string;
}
