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
    <div className="rounded-2xl glass-card p-4 sm:p-5 border border-purple-500/30 shadow-xl shadow-purple-900/10">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Informação e Status da Trava */}
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            {currentProgress.unlockedAll ? (
              <ShieldAlert className="h-6 w-6 text-amber-400" />
            ) : (
              <ShieldCheck className="h-6 w-6 text-emerald-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm sm:text-base text-foreground">
                Trava Anti-Spoiler Inteligente
              </h4>
              {currentProgress.unlockedAll ? (
                <Badge variant="warning">⚠️ Sem Restrições (Tudo Liberado)</Badge>
              ) : (
                <Badge variant="success">
                  🛡️ Protegido até T{currentProgress.season} E{currentProgress.episode}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Defina até onde você assistiu para mascarar spoilers na tela e restringir as respostas do Chat com IA.
            </p>
          </div>
        </div>

        {/* Seletores de Temporada e Episódio */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <div className="flex items-center gap-1.5 bg-background/80 border border-border/80 rounded-xl px-3 py-1.5 shadow-sm">
            <span className="text-xs text-muted-foreground font-medium">Temporada:</span>
            <select
              value={currentProgress.season}
              onChange={handleSeasonSelect}
              className="bg-transparent text-xs sm:text-sm font-bold text-purple-400 outline-none cursor-pointer"
            >
              {Array.from({ length: Math.max(totalSeasons, 1) }, (_, i) => i + 1).map((s) => (
                <option key={s} value={s} className="bg-card text-foreground">
                  Temporada {s}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-background/80 border border-border/80 rounded-xl px-3 py-1.5 shadow-sm">
            <span className="text-xs text-muted-foreground font-medium">Episódio:</span>
            <select
              value={currentProgress.episode}
              onChange={handleEpisodeSelect}
              className="bg-transparent text-xs sm:text-sm font-bold text-purple-400 outline-none cursor-pointer"
            >
              {Array.from({ length: Math.max(episodesInCurrentSeason, 1) }, (_, i) => i + 1).map((ep) => (
                <option key={ep} value={ep} className="bg-card text-foreground">
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
              className="h-9 rounded-xl gap-1 text-xs"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reativar Trava
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleUnlockAll}
              className="h-9 rounded-xl gap-1 text-xs hover:bg-amber-500/20 hover:text-amber-300"
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Já vi tudo
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
