import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MediaItem } from '../types/media';

interface RecentMediaItem extends MediaItem {
  lastAccessedAt: string;
}

interface RecentStore {
  recents: RecentMediaItem[];
  addRecent: (media: MediaItem) => void;
  removeRecent: (externalId: string) => void;
  clearRecents: () => void;
}

export const useRecentStore = create<RecentStore>()(
  persist(
    (set) => ({
      recents: [],

      addRecent: (media) =>
        set((state) => {
          const filtered = state.recents.filter(
            (item) => !(item.externalId === media.externalId && item.type === media.type)
          );
          const newItem: RecentMediaItem = {
            ...media,
            lastAccessedAt: new Date().toISOString(),
          };
          return {
            recents: [newItem, ...filtered].slice(0, 10), // Keep last 10
          };
        }),

      removeRecent: (externalId) =>
        set((state) => ({
          recents: state.recents.filter((item) => item.externalId !== externalId),
        })),

      clearRecents: () => set({ recents: [] }),
    }),
    {
      name: 'recapme_recent_medias',
    }
  )
);
