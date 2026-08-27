import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Send,
  X,
  Sparkles,
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
      {/* Botão Flutuante de Acionamento */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40 animate-in fade-in zoom-in-95 duration-300">
          <Button
            onClick={() => openChat(mediaKey, mediaTitle)}
            variant="gradient"
            size="lg"
            className="rounded-full shadow-2xl shadow-purple-600/40 hover:scale-105 transition-transform flex items-center gap-2.5 px-5 py-6"
          >
            <div className="relative">
              <Sparkles className="h-5 w-5 text-purple-200 animate-pulse" />
            </div>
            <span className="font-bold text-sm">Conversar com a IA</span>
            <Badge variant="success" className="ml-1 text-[10px] py-0 px-2 bg-emerald-500/20 text-emerald-300 border-emerald-500/40">
              T{progress.season} E{progress.episode}
            </Badge>
          </Button>
        </div>
      )}

      {/* Backdrop e Drawer Lateral */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="w-full sm:w-[480px] h-full bg-card/95 border-l border-border/60 shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300 glass"
          >
            {/* Header do Chat */}
            <div className="p-4 border-b border-border/40 flex items-center justify-between bg-background/80">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground line-clamp-1">
                    {mediaTitle}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Badge variant="success" className="text-[10px] py-0 px-1.5 gap-1">
                      <ShieldCheck className="h-2.5 w-2.5" />
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
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={closeChat}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Lista de Mensagens */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                  <div className="h-14 w-14 rounded-2xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    <Bot className="h-7 w-7" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-foreground">
                      Tire suas dúvidas sobre {mediaTitle}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-relaxed">
                      Pergunte sobre acontecimentos, personagens e tramas. A IA respeita estritamente o seu limite configurado (T{progress.season} E{progress.episode}).
                    </p>
                  </div>

                  {/* Sugestões Rápidas */}
                  <div className="w-full space-y-2 pt-2">
                    <span className="text-[11px] font-semibold uppercase text-muted-foreground tracking-wider block">
                      Perguntas Sugeridas:
                    </span>
                    {suggestedQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSend(q)}
                        className="w-full text-left p-2.5 rounded-xl bg-background/60 hover:bg-purple-600/10 border border-border/40 hover:border-purple-500/30 text-xs text-muted-foreground hover:text-purple-300 transition-all"
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
                      "flex gap-2.5 max-w-[90%]",
                      msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                    )}
                  >
                    <div
                      className={cn(
                        "h-7 w-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold shadow-sm",
                        msg.role === 'user'
                          ? "bg-purple-600 text-white"
                          : "bg-slate-800 text-purple-400 border border-border"
                      )}
                    >
                      {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>

                    <div className="flex flex-col space-y-1">
                      <div
                        className={cn(
                          "rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-md",
                          msg.role === 'user'
                            ? "bg-purple-600 text-white rounded-tr-none"
                            : "bg-card border border-border/80 text-foreground rounded-tl-none"
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
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground px-1">
                          <span>{msg.timestamp}</span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleFeedbackClick(msg.id, 'POSITIVE')}
                              className={cn(
                                "p-1 rounded hover:bg-muted transition-colors",
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
                                "p-1 rounded hover:bg-muted transition-colors",
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
                <div className="flex items-center gap-2 text-xs text-purple-400 p-2 animate-pulse">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>A IA está digitando...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input de Mensagem */}
            <div className="p-3.5 border-t border-border/40 bg-background/80">
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
                  className="flex-1 bg-card border border-border/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-purple-500/80 focus:ring-1 focus:ring-purple-500/40"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim() || isStreaming}
                  variant="gradient"
                  className="h-10 w-10 rounded-xl shrink-0"
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
