import { apiFetch } from './apiClient';
import { MediaDetail, MediaType, SearchMediaResponse } from '../types/media';

export const mediaService = {
  search: async (query: string, type?: MediaType): Promise<SearchMediaResponse> => {
    const params = new URLSearchParams();
    params.append('query', query);
    if (type) {
      params.append('type', type);
    }
    return apiFetch<SearchMediaResponse>(`/medias/search?${params.toString()}`);
  },

  getDetails: async (type: MediaType, externalId: string): Promise<MediaDetail> => {
    return apiFetch<MediaDetail>(`/medias/${type}/${externalId}`);
  },
};
