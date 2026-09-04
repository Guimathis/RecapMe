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
      const response = await fetch('http://localhost:8080/api/v1/chats/stream', {
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
      let buffer = '';
      let currentEventData = '';
      let hasDataInEvent = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            const trimmed = line.replace(/\r$/, '');
            if (trimmed.startsWith('data:')) {
              const dataChunk = trimmed.slice(5);
              if (hasDataInEvent) {
                currentEventData += '\n' + dataChunk;
              } else {
                currentEventData = dataChunk;
                hasDataInEvent = true;
              }
            } else if (trimmed === '') {
              if (hasDataInEvent) {
                onChunk(currentEventData);
                currentEventData = '';
                hasDataInEvent = false;
              }
            }
          }
        }
      }

      if (hasDataInEvent) {
        onChunk(currentEventData);
      } else if (buffer.trim()) {
        const trimmed = buffer.replace(/\r$/, '');
        if (trimmed.startsWith('data:')) {
          const dataChunk = trimmed.slice(5);
          onChunk(dataChunk);
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
