export type MediaType = 'MOVIE' | 'SERIES' | 'ANIME';

export interface MediaItem {
  id?: string;
  externalId: string;
  type: MediaType;
  source: string;
  title: string;
  originalTitle?: string;
  overview?: string;
  posterUrl?: string;
  backdropUrl?: string;
  releaseYear?: number;
  totalSeasons?: number;
  totalEpisodes?: number;
  score?: number;
  status?: string;
  seasonPeriod?: string;
  durationMinutes?: number;
  genres?: string[];
}

export interface EpisodeItemSummary {
  id?: string;
  episodeNumber: number;
  title?: string;
  thumbnailUrl?: string;
  synopsis?: string;
  durationMinutes?: number;
}

export interface SeasonItemSummary {
  id?: string;
  seasonNumber: number;
  title?: string;
  episodeCount?: number;
  episodes?: EpisodeItemSummary[];
}

export interface MediaDetail extends MediaItem {
  id?: string;
  availableSeasons: number[];
  seasons?: SeasonItemSummary[];
}

export interface SearchMediaResponse {
  items: MediaItem[];
  total: number;
}
