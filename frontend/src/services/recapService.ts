import { apiFetch } from './apiClient';
import { MediaType } from '../types/media';
import { SeasonRecap } from '../types/recap';

export const recapService = {
  getSeasonRecap: async (type: MediaType, externalId: string, season: number = 1): Promise<SeasonRecap> => {
    return apiFetch<SeasonRecap>(`/recaps/${type}/${externalId}?season=${season}`);
  },
};
