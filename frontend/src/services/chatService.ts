import { ChatStreamRequest, FeedbackRequest } from '../types/chat';
import { apiFetch } from './apiClient';

export const chatService = {
  streamMessage: async ({
    request,
    onChunk,
    onComplete,
    onError,
  }: {
    request: ChatStreamRequest;
    onChunk: (chunk: string) => void;
    onComplete: () => void;
    onError: (err: Error) => void;
  }) => {
    try {
      const response = await fetch('/chats/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Erro na comunicação com a IA: status ${response.status}`);
      }

      if (!response.body) {
        throw new Error('Nenhum dado recebido da stream');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          onChunk(chunk);
        }
      }

      onComplete();
    } catch (err: any) {
      onError(err instanceof Error ? err : new Error(String(err)));
    }
  },

  sendFeedback: async (feedback: FeedbackRequest) => {
    return apiFetch('/feedbacks', {
      method: 'POST',
      body: JSON.stringify(feedback),
    });
  },
};
