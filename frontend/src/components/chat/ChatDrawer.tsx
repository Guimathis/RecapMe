import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Send,
  X,
  ShieldCheck,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  Bot,
  User,
} from 'lucide-react';
import { useChatStore } from '@/stores/useChatStore';
import { useSpoilerStore } from '@/stores/useSpoilerStore';
import { chatService } from '@/services/chatService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { MediaType } from '@/types/media';

interface ChatDrawerProps {
  mediaKey: string;
  mediaTitle: string;
  mediaType: MediaType;
  externalId: string;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  mediaKey,
  mediaTitle,
  mediaType,
  externalId,
}) => {
  const {
    isOpen,
    openChat,
    closeChat,
    messagesByMedia,
    addMessage,
    updateLastMessageContent,
    setFeedback,
    clearChat,
    isStreaming,
    setStreaming,
  } = useChatStore();

  const { getProgress } = useSpoilerStore();
  const progress = getProgress(mediaKey);

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messages = messagesByMedia[mediaKey] || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isStreaming]);

  const handleSend = async (textToSend?: string) => {
    const question = (textToSend || input).trim();
    if (!question || isStreaming) return;

    setInput('');

    // 1. Mensagem do usuário
    const userMsgId = `user-${Date.now()}`;
    addMessage(mediaKey, {
      id: userMsgId,
      role: 'user',
      content: question,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    // 2. Mensagem placeholder da IA
    const aiMsgId = `ai-${Date.now()}`;
    addMessage(mediaKey, {
      id: aiMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    setStreaming(true);

    const historyForBackend = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    await chatService.streamMessage({
      request: {
        externalId,
        mediaType,
        title: mediaTitle,
        message: question,
        seasonCutoff: progress.unlockedAll ? 99 : progress.season,
        episodeCutoff: progress.unlockedAll ? 999 : progress.episode,
        history: historyForBackend,
      },
      onChunk: (chunk) => {
        updateLastMessageContent(mediaKey, chunk);
      },
      onComplete: () => {
        setStreaming(false);
      },
      onError: (err) => {
        setStreaming(false);
        updateLastMessageContent(
          mediaKey,
          '\n\n*Desculpe, ocorreu uma falha ao consultar o modelo de IA. Por favor tente novamente.*'
        );
        console.error('Chat stream error:', err);
      },
    });
  };

  const handleFeedbackClick = async (messageId: string, rating: 'POSITIVE' | 'NEGATIVE') => {
    setFeedback(mediaKey, messageId, rating);
    try {
      await chatService.sendFeedback({
        contextType: 'CHAT_RESPONSE',
        rating,
        comment: `Feedback da resposta na obra ${mediaTitle} (Trava T${progress.season} E${progress.episode})`,
      });
    } catch (e) {
      console.warn('Falha ao enviar feedback:', e);
    }
  };

  const suggestedQuestions = [
    'O que aconteceu no final da última temporada que assisti?',
    'Quem é o vilão revelado até o ponto que vi?',
    'Qual era o objetivo principal do protagonista no episódio mais recente?',
  ];

  return (
    <>
      {/* Avatar IA Flutuante (Inspirado no canto inferior direito do prototype) */}
      {!isOpen && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Abrir assistente IA sem spoilers"
          onClick={() => openChat(mediaKey, mediaTitle)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              openChat(mediaKey, mediaTitle);
            }
          }}
          className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-40 flex flex-col items-end cursor-pointer group select-none animate-in fade-in zoom-in-95 duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full"
        >
          {/* Tooltip speech bubble */}
          <div className="bg-white text-black text-xs font-bold px-3 py-1.5 rounded-t-lg rounded-bl-lg mb-2 shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 flex items-center gap-1.5">
            <Bot className="h-3.5 w-3.5 text-brand-purple" />
            <span>Sem spoilers! Pergunte-me!</span>
          </div>

          {/* Avatar Circle */}
          <div className="relative">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-tr from-brand-purple via-indigo-600 to-pink-500 rounded-full overflow-hidden border-3 border-brand-card shadow-[0_0_25px_rgba(157,78,221,0.5)] group-hover:scale-110 transition-transform flex items-center justify-center text-white">
              <Bot className="h-7 w-7" />
            </div>
            {/* Status dot */}
            <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-brand-dark" />
          </div>
        </div>
      )}

      {/* Backdrop e Drawer Lateral */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Chat sobre ${mediaTitle}`}
            className="w-full sm:w-[480px] h-full bg-brand-inset border-l border-brand-border shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300"
          >
            {/* Header do Chat */}
            <div className="p-4 border-b border-brand-border flex items-center justify-between bg-brand-card">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-brand-purple/20 border border-brand-purple/30 flex items-center justify-center text-brand-purple">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white line-clamp-1">
                    {mediaTitle}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Badge
                      variant="success"
                      className="text-[10px] py-0 px-2 gap-1 bg-brand-purple/20 text-brand-purple border-brand-purple/40"
                    >
                      <ShieldCheck className="h-3 w-3" />
                      {progress.unlockedAll ? 'Sem spoilers' : `Limite: T${progress.season} E${progress.episode}`}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => clearChat(mediaKey)}
                    title="Limpar histórico"
                    className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/5 cursor-pointer"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={closeChat}
                  className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/5 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Lista de Mensagens */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 hide-scrollbar">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                  <div className="h-14 w-14 rounded-2xl bg-brand-purple/15 border border-brand-purple/30 flex items-center justify-center text-brand-purple">
                    <Bot className="h-7 w-7" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-white">
                      Tire suas dúvidas sobre {mediaTitle}
                    </h4>
                    <p className="text-xs text-gray-400 mt-1 max-w-xs leading-relaxed font-light">
                      Pergunte sobre acontecimentos, personagens e tramas. A IA respeita estritamente o seu limite configurado (T{progress.season} E{progress.episode}).
                    </p>
                  </div>

                  {/* Sugestões Rápidas */}
                  <div className="w-full space-y-2 pt-4">
                    <span className="text-[11px] font-semibold uppercase text-gray-500 tracking-wider block">
                      Perguntas Sugeridas:
                    </span>
                    {suggestedQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSend(q)}
                        className="w-full text-left p-3 rounded-xl bg-brand-card hover:bg-white/5 border border-brand-border hover:border-brand-purple text-xs text-gray-300 hover:text-white transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        ✨ {q}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex gap-3 max-w-[90%]",
                      msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                    )}
                  >
                    <div
                      className={cn(
                        "h-7 w-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold shadow-sm",
                        msg.role === 'user'
                          ? "bg-brand-purple text-white"
                          : "bg-brand-card text-brand-purple border border-brand-border"
                      )}
                    >
                      {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>

                    <div className="flex flex-col space-y-1">
                      <div
                        className={cn(
                          "rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-md",
                          msg.role === 'user'
                            ? "bg-brand-purple text-white rounded-tr-none"
                            : "bg-brand-card border border-brand-border text-gray-200 rounded-tl-none"
                        )}
                      >
                        {msg.role === 'assistant' ? (
                          <div className="prose prose-invert prose-xs max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5">
                            <ReactMarkdown>{msg.content || '...'}</ReactMarkdown>
                          </div>
                        ) : (
                          msg.content
                        )}
                      </div>

                      {/* Feedback buttons for Assistant messages */}
                      {msg.role === 'assistant' && msg.content && (
                        <div className="flex items-center justify-between text-[10px] text-gray-400 px-1">
                          <span>{msg.timestamp}</span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleFeedbackClick(msg.id, 'POSITIVE')}
                              className={cn(
                                "p-1 rounded hover:bg-white/5 transition-colors cursor-pointer",
                                msg.feedback === 'POSITIVE' && "text-emerald-400"
                              )}
                              title="Resposta útil"
                            >
                              <ThumbsUp className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleFeedbackClick(msg.id, 'NEGATIVE')}
                              className={cn(
                                "p-1 rounded hover:bg-white/5 transition-colors cursor-pointer",
                                msg.feedback === 'NEGATIVE' && "text-red-400"
                              )}
                              title="Resposta ruim / com spoiler"
                            >
                              <ThumbsDown className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              {isStreaming && (
                <div className="flex items-center gap-2 text-xs text-brand-purple p-2 animate-pulse">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>A IA está sintetizando a resposta...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input de Mensagem */}
            <div className="p-3.5 border-t border-brand-border bg-brand-card">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Pergunte algo até T${progress.season} E${progress.episode}...`}
                  disabled={isStreaming}
                  className="flex-1 bg-brand-inset border border-brand-border rounded-full px-4 py-3 text-xs sm:text-sm text-white placeholder:text-gray-500 outline-none focus:border-brand-purple"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim() || isStreaming}
                  className="h-10 w-10 rounded-full shrink-0 bg-brand-purple hover:bg-brand-purple/80 text-white cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
