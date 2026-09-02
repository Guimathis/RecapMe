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
    <div className="rounded-2xl bg-brand-card p-6 md:p-8 border border-brand-border shadow-2xl space-y-5">
      <div className="flex items-center justify-between border-b border-brand-border/60 pb-4">
        <div className="flex items-center gap-2.5 text-brand-purple">
          <ListOrdered className="h-5 w-5" />
          <h3 className="text-xl font-bold text-white">
            Guia Episódio por Episódio
          </h3>
        </div>
        <span className="text-xs text-gray-400 font-medium">
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
              className="border border-brand-border rounded-xl px-4 bg-brand-inset overflow-hidden"
            >
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3.5 text-left">
                  <span className="h-8 w-8 rounded-lg bg-brand-purple/20 text-brand-purple text-xs font-bold flex items-center justify-center shrink-0 border border-brand-purple/30">
                    {ep.episodeNumber}
                  </span>
                  <div>
                    <h4 className="font-bold text-sm sm:text-base text-white">
                      {ep.title || `Episódio ${ep.episodeNumber}`}
                    </h4>
                    {isSpoiled && (
                      <span className="text-[11px] text-amber-400 font-medium flex items-center gap-1 mt-0.5">
                        <ShieldAlert className="h-3.5 w-3.5" /> Além da sua trava de spoiler (T{progress.season} E{progress.episode})
                      </span>
                    )}
                  </div>
                </div>
              </AccordionTrigger>

              <AccordionContent className="pt-2 pb-5">
                <div className="relative">
                  {/* Conteúdo com Máscara de Blur */}
                  <div
                    className={cn(
                      "transition-all duration-300 space-y-3",
                      shouldBlur && "filter blur-md select-none pointer-events-none opacity-30"
                    )}
                  >
                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-light">
                      {ep.summary}
                    </p>

                    {ep.keyEvents && ep.keyEvents.length > 0 && (
                      <div className="pt-2">
                        <span className="text-[11px] uppercase tracking-wider text-brand-purple font-bold block mb-2">
                          Eventos Principais:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {ep.keyEvents.map((evt, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="text-[11px] bg-brand-card border-brand-border text-gray-300 font-normal px-2.5 py-1"
                            >
                              {evt}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Overlay com Botão de Desbloqueio Individual */}
                  {shouldBlur && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xs rounded-lg p-5 text-center">
                      <ShieldAlert className="h-7 w-7 text-amber-400 mb-2" />
                      <p className="text-xs sm:text-sm font-semibold text-white mb-3">
                        Conteúdo oculto para evitar spoilers do episódio {ep.episodeNumber}.
                      </p>
                      <Button
                        type="button"
                        size="sm"
                        variant="orange"
                        onClick={(e) => toggleReveal(ep.episodeNumber, e)}
                        className="h-9 rounded-xl text-xs gap-2 px-4 shadow-lg"
                      >
                        <Eye className="h-4 w-4" /> Revelar este episódio
                      </Button>
                    </div>
                  )}

                  {isSpoiled && isRevealed && (
                    <div className="mt-4 pt-3 border-t border-brand-border/60 flex justify-end">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={(e) => toggleReveal(ep.episodeNumber, e)}
                        className="h-8 text-xs text-gray-400 hover:text-white gap-1.5 cursor-pointer"
                      >
                        <EyeOff className="h-3.5 w-3.5" /> Ocultar novamente
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
