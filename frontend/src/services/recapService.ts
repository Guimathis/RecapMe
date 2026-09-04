import { apiFetch } from './apiClient';
import { MediaType } from '../types/media';
import { SeasonRecap } from '../types/recap';

export interface GetSeasonRecapParams {
  mediaId: string;
  seasonId?: string;
  seasonNumber?: number;
}

const inFlightRequests = new Map<string, Promise<SeasonRecap>>();

export const recapService = {
  getSeasonRecap: async (
    paramsOrType: GetSeasonRecapParams | MediaType,
    legacyExternalId?: string,
    legacySeason: number = 1
  ): Promise<SeasonRecap> => {
    let mediaId: string;
    let seasonId: string | undefined;
    let seasonNumber: number;

    if (typeof paramsOrType === 'object') {
      mediaId = paramsOrType.mediaId;
      seasonId = paramsOrType.seasonId;
      seasonNumber = paramsOrType.seasonNumber ?? 1;
    } else {
      mediaId = legacyExternalId || '';
      seasonNumber = legacySeason;
    }

    if (!mediaId) {
      throw new Error('mediaId é obrigatório para consultar ou sintetizar resumos.');
    }

    // Chave única para deduplicar requisições concorrentes em voo
    const requestKey = `${mediaId}:${seasonId || 'none'}:${seasonNumber}`;
    if (inFlightRequests.has(requestKey)) {
      return inFlightRequests.get(requestKey)!;
    }

    const fetchPromise = (async () => {
      const queryParams = new URLSearchParams();
      queryParams.append('mediaId', mediaId);
      if (seasonId) {
        queryParams.append('seasonId', seasonId);
      }

      try {
        // 1. Tenta recuperar o resumo já persistido no banco local
        const res = await apiFetch<any>(`/v1/recaps?${queryParams.toString()}`);
        return {
          id: res.id,
          mediaId: res.mediaId,
          seasonId: res.seasonId,
          seasonNumber,
          content: res.content,
          seasonSummary: res.content,
          targetType: res.targetType,
          spoilerLevel: res.spoilerLevel,
          keyTakeaways: [],
          episodes: [],
        };
      } catch {
        // 2. Se não existir (404), solicita a síntese sob demanda via Spring AI
        const saveRes = await apiFetch<any>('/v1/recaps', {
          method: 'POST',
          body: JSON.stringify({
            mediaId,
            seasonId: seasonId || undefined,
            targetType: seasonId ? 'SEASON' : 'MEDIA',
            spoilerLevel: `S${seasonNumber}`,
          }),
        });

        return {
          id: saveRes.id,
          mediaId: saveRes.mediaId,
          seasonId: saveRes.seasonId,
          seasonNumber,
          content: saveRes.content,
          seasonSummary: saveRes.content,
          targetType: saveRes.targetType,
          spoilerLevel: saveRes.spoilerLevel,
          keyTakeaways: [],
          episodes: [],
        };
      }
    })().finally(() => {
      inFlightRequests.delete(requestKey);
    });

    inFlightRequests.set(requestKey, fetchPromise);
    return fetchPromise;
  },
};
