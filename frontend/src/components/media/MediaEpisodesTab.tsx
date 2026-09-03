import React, { useState } from 'react';
import { Tv, Film, Layers } from 'lucide-react';
import { MediaDetail, EpisodeItemSummary } from '@/types/media';
import { EpisodeItem } from '@/types/recap';
import { cn } from '@/lib/utils';

interface MediaEpisodesTabProps {
  media: MediaDetail;
  selectedSeason: number;
  onSeasonChange?: (season: number) => void;
  recapEpisodes?: EpisodeItem[];
}

export const MediaEpisodesTab: React.FC<MediaEpisodesTabProps> = ({
  media,
  selectedSeason,
  onSeasonChange,
  recapEpisodes,
}) => {
  // Rastreia falha no carregamento de imagens individuais para exibir fallback
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  const handleImageError = (epNumber: number) => {
    setImageErrors((prev) => ({ ...prev, [epNumber]: true }));
  };

  // 1. Obter lista de episódios da temporada
  const seasonFromMedia = media.seasons?.find((s) => s.seasonNumber === selectedSeason);
  let episodes: EpisodeItemSummary[] = [];

  if (seasonFromMedia?.episodes && seasonFromMedia.episodes.length > 0) {
    episodes = seasonFromMedia.episodes;
  } else if (recapEpisodes && recapEpisodes.length > 0) {
    // Fallback: episódios do resumo da temporada (quando a ingestão do Kitsu ainda não ocorreu)
    episodes = recapEpisodes.map((ep) => ({
      episodeNumber: ep.episodeNumber,
      title: ep.title,
      thumbnailUrl: undefined,
    }));
  } else if (media.totalEpisodes && media.totalEpisodes > 0) {
    // Fallback: enumeração caso só tenhamos o total de episódios
    episodes = Array.from({ length: media.totalEpisodes }, (_, i) => ({
      episodeNumber: i + 1,
      title: undefined,
      thumbnailUrl: undefined,
    }));
  }

  // Lista de temporadas disponíveis
  const availableSeasons =
    media.availableSeasons && media.availableSeasons.length > 0
      ? media.availableSeasons
      : Array.from({ length: media.totalSeasons || 1 }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      {/* Barra de controle: Seletor de Temporadas e Contagem de Episódios */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-t border-brand-border/60 pb-4 pt-4">
        {/* Seletor de Temporadas (quando há mais de uma) */}
        {availableSeasons.length > 1 ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold mr-1 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-brand-purple" /> Temporadas:
            </span>
            {availableSeasons.map((seasonNum) => {
              const isActive = seasonNum === selectedSeason;
              return (
                <button
                  key={seasonNum}
                  type="button"
                  onClick={() => onSeasonChange?.(seasonNum)}
                  className={cn(
                    "text-xs sm:text-sm font-medium px-4 py-1.5 rounded-full transition-all cursor-pointer border",
                    isActive
                      ? "bg-brand-purple text-white border-brand-purple shadow-md"
                      : "bg-brand-card/80 text-gray-300 border-brand-border hover:bg-white/5 hover:text-white"
                  )}
                >
                  Temporada {seasonNum}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Tv className="h-4 w-4 text-brand-purple" />
            <span>Temporada {selectedSeason}</span>
          </div>
        )}

        <span className="text-xs text-gray-400 font-medium">
          {episodes.length} {episodes.length === 1 ? 'episódio' : 'episódios'}
        </span>
      </div>

      {/* Grid de Episódios */}
      {episodes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {episodes.map((ep) => {
            const hasError = imageErrors[ep.episodeNumber];
            const hasThumb = ep.thumbnailUrl && !hasError;
            const episodeTitle = ep.title?.trim() || `Episódio ${ep.episodeNumber}`;

            return (
              <div
                key={ep.id || ep.episodeNumber}
                className="bg-brand-card rounded-2xl border border-brand-border overflow-hidden group hover:border-brand-purple/60 transition-all duration-300 shadow-xl flex flex-col hover:-translate-y-1 transform-gpu"
              >
                {/* Contêiner da Thumbnail (16:9) */}
                <div className="relative aspect-video w-full overflow-hidden bg-brand-inset shrink-0">
                  {hasThumb ? (
                    <img
                      src={ep.thumbnailUrl}
                      alt={episodeTitle}
                      loading="lazy"
                      onError={() => handleImageError(ep.episodeNumber)}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-brand-card via-brand-inset to-brand-dark/90 text-gray-500 gap-2 p-4">
                      <Film className="h-8 w-8 text-gray-600 group-hover:text-brand-purple/60 transition-colors" />
                      <span className="text-[11px] text-gray-500 font-medium">Sem imagem</span>
                    </div>
                  )}

                  {/* Gradiente de contraste inferior */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

                  {/* Badge com o número do episódio */}
                  <div className="absolute top-2.5 left-2.5 z-10">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold text-white bg-black/70 backdrop-blur-md border border-white/20 shadow-md">
                      EP {ep.episodeNumber}
                    </span>
                  </div>

                  {/* Duração se disponível */}
                  {ep.durationMinutes ? (
                    <div className="absolute bottom-2 right-2 z-10">
                      <span className="text-[10px] text-gray-300 bg-black/75 backdrop-blur-xs px-1.5 py-0.5 rounded font-medium">
                        {ep.durationMinutes} min
                      </span>
                    </div>
                  ) : null}
                </div>

                {/* Dados do Episódio */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                  <div className="space-y-1">
                    <span className="text-[11px] uppercase tracking-wider text-brand-purple font-semibold block">
                      Episódio {ep.episodeNumber}
                    </span>
                    <h4
                      className="font-bold text-sm sm:text-base text-white line-clamp-2 group-hover:text-brand-purple transition-colors leading-snug"
                      title={episodeTitle}
                    >
                      {episodeTitle}
                    </h4>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-16 text-center rounded-2xl bg-brand-card border border-brand-border text-sm text-gray-400 space-y-2">
          <Tv className="h-8 w-8 mx-auto text-gray-500" />
          <p>Nenhum episódio catalogado para esta temporada.</p>
        </div>
      )}
    </div>
  );
};
