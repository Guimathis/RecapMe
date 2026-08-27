import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SpoilerProgress {
  season: number;
  episode: number;
  unlockedAll: boolean;
}

interface SpoilerStore {
  progressByMedia: Record<string, SpoilerProgress>;
  setProgress: (mediaKey: string, season: number, episode: number) => void;
  setUnlockAll: (mediaKey: string, unlocked: boolean) => void;
  getProgress: (mediaKey: string) => SpoilerProgress;
}

export const useSpoilerStore = create<SpoilerStore>()(
  persist(
    (set, get) => ({
      progressByMedia: {},

      setProgress: (mediaKey, season, episode) =>
        set((state) => ({
          progressByMedia: {
            ...state.progressByMedia,
            [mediaKey]: { season, episode, unlockedAll: false },
          },
        })),

      setUnlockAll: (mediaKey, unlocked) =>
        set((state) => {
          const current = state.progressByMedia[mediaKey] || { season: 1, episode: 1, unlockedAll: false };
          return {
            progressByMedia: {
              ...state.progressByMedia,
              [mediaKey]: { ...current, unlockedAll: unlocked },
            },
          };
        }),

      getProgress: (mediaKey) => {
        const state = get();
        return state.progressByMedia[mediaKey] || { season: 1, episode: 1, unlockedAll: false };
      },
    }),
    {
      name: 'recapme_spoiler_progress',
    }
  )
);
