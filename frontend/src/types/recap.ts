import { MediaType } from './media';

export interface EpisodeItem {
  episodeNumber: number;
  title: string;
  summary: string;
  keyEvents?: string[];
}

export interface SeasonRecap {
  id?: string;
  mediaId: string;
  seasonId?: string;
  externalId?: string;
  mediaType?: MediaType;
  mediaTitle?: string;
  seasonNumber: number;
  seasonTitle?: string;
  seasonSummary?: string;
  content?: string;
  targetType?: string;
  spoilerLevel?: string;
  keyTakeaways?: string[];
  episodes?: EpisodeItem[];
}
