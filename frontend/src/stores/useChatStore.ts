import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ChatMessage } from '../types/chat';

interface ChatStore {
  isOpen: boolean;
  activeMediaKey: string | null;
  activeMediaTitle: string;
  messagesByMedia: Record<string, ChatMessage[]>;
  isStreaming: boolean;

  openChat: (mediaKey: string, mediaTitle: string) => void;
  closeChat: () => void;
  addMessage: (mediaKey: string, message: ChatMessage) => void;
  updateLastMessageContent: (mediaKey: string, chunk: string) => void;
  setFeedback: (mediaKey: string, messageId: string, feedback: 'POSITIVE' | 'NEGATIVE') => void;
  clearChat: (mediaKey: string) => void;
  setStreaming: (isStreaming: boolean) => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      isOpen: false,
      activeMediaKey: null,
      activeMediaTitle: '',
      messagesByMedia: {},
      isStreaming: false,

      openChat: (mediaKey, mediaTitle) =>
        set({ isOpen: true, activeMediaKey: mediaKey, activeMediaTitle: mediaTitle }),

      closeChat: () => set({ isOpen: false }),

      addMessage: (mediaKey, message) =>
        set((state) => {
          const current = state.messagesByMedia[mediaKey] || [];
          return {
            messagesByMedia: {
              ...state.messagesByMedia,
              [mediaKey]: [...current, message],
            },
          };
        }),

      updateLastMessageContent: (mediaKey, chunk) =>
        set((state) => {
          const current = state.messagesByMedia[mediaKey] || [];
          if (current.length === 0) return state;

          const updated = [...current];
          const lastIdx = updated.length - 1;
          updated[lastIdx] = {
            ...updated[lastIdx],
            content: updated[lastIdx].content + chunk,
          };

          return {
            messagesByMedia: {
              ...state.messagesByMedia,
              [mediaKey]: updated,
            },
          };
        }),

      setFeedback: (mediaKey, messageId, feedback) =>
        set((state) => {
          const current = state.messagesByMedia[mediaKey] || [];
          const updated = current.map((msg) =>
            msg.id === messageId ? { ...msg, feedback } : msg
          );
          return {
            messagesByMedia: {
              ...state.messagesByMedia,
              [mediaKey]: updated,
            },
          };
        }),

      clearChat: (mediaKey) =>
        set((state) => ({
          messagesByMedia: {
            ...state.messagesByMedia,
            [mediaKey]: [],
          },
        })),

      setStreaming: (isStreaming) => set({ isStreaming }),
    }),
    {
      name: 'recapme_chat_history',
      partialize: (state) => ({ messagesByMedia: state.messagesByMedia }),
    }
  )
);
