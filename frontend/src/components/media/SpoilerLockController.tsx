import React from 'react';
import { ShieldCheck, ShieldAlert, CheckCircle2, RotateCcw } from 'lucide-react';
import { useSpoilerStore } from '@/stores/useSpoilerStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SpoilerLockControllerProps {
  mediaKey: string;
  totalSeasons: number;
  episodesInCurrentSeason?: number;
  currentSeason: number;
  onSeasonChange: (season: number) => void;
}

export const SpoilerLockController: React.FC<SpoilerLockControllerProps> = ({
  mediaKey,
  totalSeasons,
  episodesInCurrentSeason = 12,
  currentSeason,
  onSeasonChange,
}) => {
  const { progressByMedia, setProgress, setUnlockAll } = useSpoilerStore();
  const currentProgress = progressByMedia[mediaKey] || {
    season: currentSeason || 1,
    episode: 1,
    unlockedAll: false,
  };

  const handleSeasonSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const s = parseInt(e.target.value, 10);
    onSeasonChange(s);
    setProgress(mediaKey, s, currentProgress.episode);
  };

  const handleEpisodeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const ep = parseInt(e.target.value, 10);
    setProgress(mediaKey, currentProgress.season, ep);
  };

  const handleUnlockAll = () => {
    setUnlockAll(mediaKey, true);
  };

  const handleResetLock = () => {
    setProgress(mediaKey, 1, 1);
  };

  return (
    <div className="rounded-2xl bg-brand-card p-5 sm:p-6 border border-brand-border shadow-2xl">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
        {/* Informação e Status da Trava */}
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-brand-purple/20 border border-brand-purple/40 flex items-center justify-center text-brand-purple shrink-0 shadow-lg shadow-brand-purple/20">
            {currentProgress.unlockedAll ? (
              <ShieldAlert className="h-6 w-6 text-amber-400" />
            ) : (
              <ShieldCheck className="h-6 w-6 text-brand-purple" />
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="font-bold text-base sm:text-lg text-white">
                Trava Anti-Spoiler Inteligente
              </h4>
              {currentProgress.unlockedAll ? (
                <Badge variant="warning" className="bg-amber-500/20 text-amber-300 border-amber-500/40">
                  Sem Restrições (Tudo Liberado)
                </Badge>
              ) : (
                <Badge variant="success" className="bg-brand-purple/20 text-brand-purple border-brand-purple/40">
                  Protegido até T{currentProgress.season} E{currentProgress.episode}
                </Badge>
              )}
            </div>
            <p className="text-xs sm:text-sm text-gray-400 mt-1 font-light">
              Defina até onde você assistiu para mascarar spoilers na tela e restringir as respostas do Chat com IA.
            </p>
          </div>
        </div>

        {/* Seletores de Temporada e Episódio */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-2 bg-brand-inset border border-brand-border rounded-xl px-3.5 py-2 shadow-sm">
            <span className="text-xs text-gray-400 font-medium">Temporada:</span>
            <select
              value={currentProgress.season}
              onChange={handleSeasonSelect}
              className="bg-transparent text-xs sm:text-sm font-bold text-brand-purple outline-none cursor-pointer"
            >
              {Array.from({ length: Math.max(totalSeasons, 1) }, (_, i) => i + 1).map((s) => (
                <option key={s} value={s} className="bg-brand-card text-white">
                  Temporada {s}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-brand-inset border border-brand-border rounded-xl px-3.5 py-2 shadow-sm">
            <span className="text-xs text-gray-400 font-medium">Episódio:</span>
            <select
              value={currentProgress.episode}
              onChange={handleEpisodeSelect}
              className="bg-transparent text-xs sm:text-sm font-bold text-brand-purple outline-none cursor-pointer"
            >
              {Array.from({ length: Math.max(episodesInCurrentSeason, 1) }, (_, i) => i + 1).map((ep) => (
                <option key={ep} value={ep} className="bg-brand-card text-white">
                  Episódio {ep}
                </option>
              ))}
            </select>
          </div>

          {currentProgress.unlockedAll ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetLock}
              className="h-10 rounded-xl gap-1.5 text-xs border-brand-border hover:bg-white/5 text-gray-300 hover:text-white cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reativar Trava
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleUnlockAll}
              className="h-10 rounded-xl gap-1.5 text-xs bg-brand-orange/20 hover:bg-brand-orange/30 text-brand-orange border border-brand-orange/40 font-bold cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4" /> Já vi tudo
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
