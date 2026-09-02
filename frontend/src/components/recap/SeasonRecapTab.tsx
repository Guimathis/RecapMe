import React from 'react';
import { CheckCircle, BookOpen } from 'lucide-react';
import { SeasonRecap } from '@/types/recap';

interface SeasonRecapTabProps {
  recap: SeasonRecap;
}

export const SeasonRecapTab: React.FC<SeasonRecapTabProps> = ({ recap }) => {
  return (
    <div className="space-y-6">
      {/* Resumo Geral da Temporada */}
      <div className="rounded-2xl bg-brand-card p-6 md:p-8 border border-brand-border shadow-2xl">
        <div className="flex items-center gap-2.5 mb-4 text-brand-purple">
          <BookOpen className="h-5 w-5" />
          <h3 className="text-xl font-bold text-white">
            Visão Geral — Temporada {recap.seasonNumber}
          </h3>
        </div>
        <p className="text-sm sm:text-base text-gray-300 leading-relaxed whitespace-pre-line font-light">
          {recap.seasonSummary}
        </p>
      </div>

      {/* Pontos-Chave / Principais Revelações (Key Takeaways) */}
      {recap.keyTakeaways && recap.keyTakeaways.length > 0 && (
        <div className="rounded-2xl bg-brand-card p-6 md:p-8 border border-brand-border shadow-2xl">
          <div className="mb-5">
            <h4 className="text-lg font-bold text-white">
              Pontos Cruciais que Você Precisa Lembrar
            </h4>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recap.keyTakeaways.map((point, index) => (
              <li
                key={index}
                className="flex items-start gap-3 p-4 rounded-xl bg-brand-inset border border-brand-border text-xs sm:text-sm text-gray-300 leading-relaxed font-light"
              >
                <CheckCircle className="h-4 w-4 text-brand-purple shrink-0 mt-0.5" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
