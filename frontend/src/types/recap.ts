import { MediaType } from './media';

export interface EpisodeItem {
  episodeNumber: number;
  title: string;
  summary: string;
  keyEvents: string[];
}

export interface SeasonRecap {
  mediaId: string;
  externalId: string;
  mediaType: MediaType;
  mediaTitle: string;
  seasonNumber: number;
  seasonTitle?: string;
  seasonSummary: string;
  keyTakeaways: string[];
  episodes: EpisodeItem[];
}
