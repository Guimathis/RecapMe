import React, { useState } from 'react';
import { Eye, EyeOff, ShieldAlert, ListOrdered } from 'lucide-react';
import { EpisodeItem } from '@/types/recap';
import { useSpoilerStore } from '@/stores/useSpoilerStore';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface EpisodeAccordionListProps {
  mediaKey: string;
  seasonNumber: number;
  episodes: EpisodeItem[];
}

export const EpisodeAccordionList: React.FC<EpisodeAccordionListProps> = ({
  mediaKey,
  seasonNumber,
  episodes,
}) => {
  const { getProgress } = useSpoilerStore();
  const progress = getProgress(mediaKey);
  const [revealedEpisodes, setRevealedEpisodes] = useState<Record<number, boolean>>({});

  const toggleReveal = (epNumber: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setRevealedEpisodes((prev) => ({
      ...prev,
      [epNumber]: !prev[epNumber],
    }));
  };

  const isEpisodeSpoilered = (epNumber: number) => {
    if (progress.unlockedAll) return false;
    if (seasonNumber < progress.season) return false;
    if (seasonNumber > progress.season) return true;
    return epNumber > progress.episode;
  };

  return (
    <div className="rounded-2xl glass-card p-6 border border-border/60 shadow-lg space-y-4">
      <div className="flex items-center justify-between border-b border-border/40 pb-4">
        <div className="flex items-center gap-2 text-purple-400">
          <ListOrdered className="h-5 w-5" />
          <h3 className="text-lg font-bold text-foreground">
            Guia Episódio por Episódio
          </h3>
        </div>
        <span className="text-xs text-muted-foreground">
          {episodes.length} episódios catalogados
        </span>
      </div>

      <Accordion type="single" collapsible className="w-full space-y-3">
        {episodes.map((ep) => {
          const isSpoiled = isEpisodeSpoilered(ep.episodeNumber);
          const isRevealed = revealedEpisodes[ep.episodeNumber];
          const shouldBlur = isSpoiled && !isRevealed;

          return (
            <AccordionItem
              key={ep.episodeNumber}
              value={`ep-${ep.episodeNumber}`}
              className="border border-border/60 rounded-xl px-4 bg-card/40 overflow-hidden"
            >
              <AccordionTrigger className="hover:no-underline py-3.5">
                <div className="flex items-center gap-3 text-left">
                  <span className="h-7 w-7 rounded-lg bg-purple-600/20 text-purple-400 text-xs font-bold flex items-center justify-center shrink-0">
                    {ep.episodeNumber}
                  </span>
                  <div>
                    <h4 className="font-semibold text-sm text-foreground">
                      {ep.title || `Episódio ${ep.episodeNumber}`}
                    </h4>
                    {isSpoiled && (
                      <span className="text-[10px] text-amber-400 font-medium flex items-center gap-1 mt-0.5">
                        <ShieldAlert className="h-3 w-3" /> Além da sua trava de spoiler (T{progress.season} E{progress.episode})
                      </span>
                    )}
                  </div>
                </div>
              </AccordionTrigger>

              <AccordionContent className="pt-2 pb-4">
                <div className="relative">
                  {/* Conteúdo com Máscara de Blur */}
                  <div
                    className={cn(
                      "transition-all duration-300 space-y-3",
                      shouldBlur && "filter blur-sm select-none pointer-events-none opacity-40"
                    )}
                  >
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {ep.summary}
                    </p>

                    {ep.keyEvents && ep.keyEvents.length > 0 && (
                      <div className="pt-2">
                        <span className="text-[11px] uppercase tracking-wider text-purple-400 font-bold block mb-1.5">
                          Eventos Principais:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {ep.keyEvents.map((evt, idx) => (
                            <Badge key={idx} variant="outline" className="text-[11px] bg-background/60 font-normal">
                              {evt}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Overlay com Botão de Desbloqueio Individual */}
                  {shouldBlur && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-xs rounded-lg p-4 text-center">
                      <ShieldAlert className="h-6 w-6 text-amber-400 mb-1.5" />
                      <p className="text-xs font-semibold text-foreground mb-2">
                        Conteúdo oculto para evitar spoilers.
                      </p>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={(e) => toggleReveal(ep.episodeNumber, e)}
                        className="h-8 rounded-lg text-xs gap-1.5"
                      >
                        <Eye className="h-3.5 w-3.5" /> Revelar este episódio
                      </Button>
                    </div>
                  )}

                  {isSpoiled && isRevealed && (
                    <div className="mt-3 pt-2 border-t border-border/40 flex justify-end">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={(e) => toggleReveal(ep.episodeNumber, e)}
                        className="h-7 text-[11px] text-muted-foreground hover:text-foreground gap-1"
                      >
                        <EyeOff className="h-3 w-3" /> Ocultar novamente
                      </Button>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
};
