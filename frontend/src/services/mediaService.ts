import { apiFetch } from './apiClient';
import { MediaDetail, MediaItem, MediaType, SearchMediaResponse } from '../types/media';

/**
 * Normaliza qualquer objeto de mídia vindo do backend (MediaSummaryDto, OneMediaResponseDto)
 * ou de mocks locais para a interface `MediaItem`, garantindo chaves e atributos consistentes.
 */
export function normalizeMediaItem(raw: any): MediaItem {
  if (!raw) return {} as MediaItem;

  // Garante identificador unificado
  const externalId = String(
    raw.externalId ||
    raw.id ||
    raw.anilistId ||
    raw.kitsuId ||
    ''
  );

  // Determinar o MediaType a partir do type ou format
  let type: MediaType = raw.type || 'ANIME';
  if (!raw.type && raw.format) {
    const fmt = String(raw.format).toUpperCase();
    if (fmt === 'MOVIE') {
      type = 'MOVIE';
    } else if (fmt === 'TV' || fmt === 'TV_SHORT' || fmt === 'OVA' || fmt === 'ONA') {
      type = 'ANIME';
    } else {
      type = 'ANIME';
    }
  }

  // Título prioriza português -> inglês -> romaji -> título genérico
  const title =
    raw.title ||
    raw.titlePortuguese ||
    raw.titleEnglish ||
    raw.titleRomaji ||
    'Obra sem título';

  const originalTitle =
    raw.originalTitle ||
    raw.titleRomaji ||
    (raw.titleEnglish && raw.titleEnglish !== title ? raw.titleEnglish : undefined);

  const overview = raw.overview || raw.synopsis || '';
  const posterUrl = raw.posterUrl || raw.coverImageUrl || undefined;
  const backdropUrl = raw.backdropUrl || raw.bannerImageUrl || undefined;
  const releaseYear = raw.releaseYear || raw.seasonYear || undefined;
  const totalEpisodes = raw.totalEpisodes || undefined;
  const totalSeasons = raw.totalSeasons || 1;
  const source = raw.source || 'AniList';
  const score = raw.score != null ? Number(raw.score) : undefined;
  const status = raw.status ? String(raw.status) : undefined;
  const seasonPeriod = raw.seasonPeriod ? String(raw.seasonPeriod) : undefined;
  const durationMinutes = raw.durationMinutes != null ? Number(raw.durationMinutes) : undefined;
  const genres = Array.isArray(raw.genres)
    ? raw.genres.map(String)
    : raw.genres instanceof Set
    ? Array.from(raw.genres).map(String)
    : undefined;

  return {
    id: raw.id ? String(raw.id) : undefined,
    externalId,
    type,
    source,
    title,
    originalTitle,
    overview,
    posterUrl,
    backdropUrl,
    releaseYear,
    totalSeasons,
    totalEpisodes,
    score,
    status,
    seasonPeriod,
    durationMinutes,
    genres,
  };
}

export const mediaService = {
  search: async (query: string, type?: MediaType): Promise<SearchMediaResponse> => {
    const params = new URLSearchParams();
    params.append('query', query);
    if (type) {
      params.append('type', type);
    }
    const res = await apiFetch<any>(`/medias/search?${params.toString()}`);
    if (!res) return { items: [], total: 0 };
    const rawList: any[] = Array.isArray(res)
      ? res
      : Array.isArray(res.content)
      ? res.content
      : Array.isArray(res.items)
      ? res.items
      : [];
    return {
      items: rawList.map(normalizeMediaItem),
      total: res.totalElements || res.total || rawList.length,
    };
  },

  getDetails: async (type: MediaType, externalId: string): Promise<MediaDetail> => {
    let data: any;
    try {
      data = await apiFetch<any>(`/v1/medias/${externalId}`);
    } catch {
      data = await apiFetch<any>(`/v1/medias/${type}/${externalId}`);
    }
    const normalized = normalizeMediaItem(data);
    return {
      ...normalized,
      availableSeasons:
        data?.availableSeasons ||
        (data?.seasons ? data.seasons.map((s: any) => s.seasonNumber || s) : [1]),
    };
  },

  getByEndpoint: async (endpoint: string): Promise<MediaItem[]> => {
    const data = await apiFetch<any>(endpoint);
    if (!data) return [];
    let list: any[] = [];
    if (Array.isArray(data)) list = data;
    else if (Array.isArray(data.content)) list = data.content;
    else if (Array.isArray(data.items)) list = data.items;
    return list.map(normalizeMediaItem);
  },
};
