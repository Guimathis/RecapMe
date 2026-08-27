import React from 'react';
import { Sparkles, CheckCircle, BookOpen } from 'lucide-react';
import { SeasonRecap } from '@/types/recap';

interface SeasonRecapTabProps {
  recap: SeasonRecap;
}

export const SeasonRecapTab: React.FC<SeasonRecapTabProps> = ({ recap }) => {
  return (
    <div className="space-y-6">
      {/* Resumo Geral da Temporada */}
      <div className="rounded-2xl glass-card p-6 border border-border/60 shadow-lg">
        <div className="flex items-center gap-2 mb-3 text-purple-400">
          <BookOpen className="h-5 w-5" />
          <h3 className="text-lg font-bold text-foreground">
            Visão Geral — Temporada {recap.seasonNumber}
          </h3>
        </div>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed whitespace-pre-line">
          {recap.seasonSummary}
        </p>
      </div>

      {/* Pontos-Chave / Principais Revelações (Key Takeaways) */}
      {recap.keyTakeaways && recap.keyTakeaways.length > 0 && (
        <div className="rounded-2xl glass-card p-6 border border-purple-500/20 shadow-lg bg-gradient-to-br from-purple-950/20 to-transparent">
          <div className="flex items-center gap-2 mb-4 text-purple-400">
            <Sparkles className="h-5 w-5" />
            <h4 className="text-base font-bold text-foreground">
              Pontos Cruciais que Você Precisa Lembrar
            </h4>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recap.keyTakeaways.map((point, index) => (
              <li
                key={index}
                className="flex items-start gap-2.5 p-3 rounded-xl bg-background/50 border border-border/40 text-xs sm:text-sm text-muted-foreground"
              >
                <CheckCircle className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
