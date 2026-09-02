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

export interface MediaDetail extends MediaItem {
  id?: string;
  availableSeasons: number[];
}

export interface SearchMediaResponse {
  items: MediaItem[];
  total: number;
}
