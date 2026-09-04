import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Film, Loader2, Calendar, Layers, Star, Clock, Tv, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { mediaService } from '@/services/mediaService';
import { recapService } from '@/services/recapService';
import { MediaDetail, MediaType } from '@/types/media';
import { SeasonRecap } from '@/types/recap';
import { useRecentStore } from '@/stores/useRecentStore';
import { useSpoilerStore } from '@/stores/useSpoilerStore';
import { useChatStore } from '@/stores/useChatStore';
import { SpoilerLockController } from '@/components/media/SpoilerLockController';
import { SeasonRecapTab } from '@/components/recap/SeasonRecapTab';
import { EpisodeAccordionList } from '@/components/recap/EpisodeAccordionList';
import { MediaEpisodesTab } from '@/components/media/MediaEpisodesTab';
import { ChatDrawer } from '@/components/chat/ChatDrawer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const PERIOD_MAP: Record<string, string> = {
  WINTER: 'Inverno',
  SPRING: 'Primavera',
  SUMMER: 'Verão',
  FALL: 'Outono',
};

const GENRE_MAP: Record<string, string> = {
  Action: 'Ação',
  Adventure: 'Aventura',
  Comedy: 'Comédia',
  Drama: 'Drama',
  Fantasy: 'Fantasia',
  Horror: 'Terror',
  Mystery: 'Mistério',
  Psychological: 'Psicológico',
  Romance: 'Romance',
  'Sci-Fi': 'Ficção Científica',
  'Science Fiction': 'Ficção Científica',
  'Slice of Life': 'Slice of Life',
  Sports: 'Esportes',
  Supernatural: 'Sobrenatural',
  Thriller: 'Suspense',
  Animation: 'Animação',
};

function formatStatus(status?: string): { label: string; isReleasing: boolean } | null {
  if (!status) return null;
  const upper = status.toUpperCase();
  switch (upper) {
    case 'RELEASING':
      return { label: 'Em Lançamento', isReleasing: true };
    case 'FINISHED':
      return { label: 'Finalizado', isReleasing: false };
    case 'NOT_YET_RELEASED':
      return { label: 'Em Breve', isReleasing: false };
    case 'CANCELLED':
      return { label: 'Cancelado', isReleasing: false };
    case 'HIATUS':
      return { label: 'Em Hiato', isReleasing: false };
    default:
      return { label: status, isReleasing: false };
  }
}

function formatSeason(period?: string, year?: number): string | null {
  if (!period && !year) return null;
  const periodPt = period ? PERIOD_MAP[period.toUpperCase()] || period : null;
  if (periodPt && year) return `${periodPt} de ${year}`;
  if (periodPt) return periodPt;
  return year ? String(year) : null;
}

export const MediaDetailPage: React.FC = () => {
  const { type, id } = useParams<{ type: string; id: string }>();
  const mediaType = (type?.toUpperCase() as MediaType) || 'SERIES';
  const externalId = id || '';
  const mediaKey = `${mediaType}-${externalId}`;

  const { addRecent } = useRecentStore();
  const { progressByMedia, setProgress } = useSpoilerStore();

  const location = useLocation();
  const { openChat } = useChatStore();

  const [media, setMedia] = useState<MediaDetail | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [recap, setRecap] = useState<SeasonRecap | null>(null);
  const [loadingMedia, setLoadingMedia] = useState<boolean>(true);
  const [loadingRecap, setLoadingRecap] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);
  const synopsisRef = useRef<HTMLParagraphElement>(null);

  // 1. Carregar Detalhes da Mídia
  useEffect(() => {
    const fetchDetails = async () => {
      if (!externalId) return;
      setLoadingMedia(true);
      setError(null);
      try {
        const details = await mediaService.getDetails(mediaType, externalId);
        setMedia(details);
        addRecent(details);

        // Inicializar trava de spoiler se não existir
        if (!progressByMedia[mediaKey]) {
          setProgress(mediaKey, 1, 1);
        }

        // Abrir chat automaticamente se solicitado via navegação (state ou query param)
        if (location.state?.openChat || new URLSearchParams(location.search).get('chat') === 'true') {
          openChat(mediaKey, details.title);
        }
      } catch (err: any) {
        setError(err.message || 'Falha ao carregar detalhes da obra.');
      } finally {
        setLoadingMedia(false);
      }
    };
    fetchDetails();
  }, [mediaType, externalId]);

  // 2. Carregar Resumo da Temporada Selecionada
  useEffect(() => {
    const fetchRecap = async () => {
      // Aguarda o término do carregamento da mídia e disponibilidade do ID real
      if (loadingMedia || !media?.id) return;

      const currentSeasonObj = media.seasons?.find((s) => s.seasonNumber === selectedSeason);
      const seasonId = currentSeasonObj?.id;

      setLoadingRecap(true);
      try {
        const recapData = await recapService.getSeasonRecap({
          mediaId: media.id,
          seasonId,
          seasonNumber: selectedSeason,
        });
        setRecap(recapData);
      } catch (err: any) {
        console.warn('Erro ao carregar resumo da temporada:', err);
      } finally {
        setLoadingRecap(false);
      }
    };
    fetchRecap();
  }, [loadingMedia, media?.id, selectedSeason, media?.seasons]);

  // 3. Controle de expansão da sinopse
  useEffect(() => {
    setIsExpanded(false);
    const checkOverflow = () => {
      if (synopsisRef.current) {
        const isOverflowing = synopsisRef.current.scrollHeight > synopsisRef.current.clientHeight + 1;
        setCanExpand(isOverflowing || (media?.overview?.length || 0) > 300);
      }
    };
    checkOverflow();
    const timer = setTimeout(checkOverflow, 150);
    window.addEventListener('resize', checkOverflow);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkOverflow);
    };
  }, [media?.overview]);

  if (loadingMedia) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-32 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-brand-purple" />
        <p className="text-sm text-gray-400">Carregando...</p>
      </div>
    );
  }

  if (error || !media) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-32 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Obra não encontrada</h2>
        <p className="text-sm text-gray-400">{error || 'Não foi possível obter os dados desta obra.'}</p>
        <Link to="/">
          <Button variant="outline" className="gap-2 border-brand-border hover:bg-white/5 cursor-pointer">
            <ArrowLeft className="h-4 w-4" /> Voltar para a Home
          </Button>
        </Link>
      </div>
    );
  }

  const currentSeasonObj = media.seasons?.find((s) => s.seasonNumber === selectedSeason);
  const episodesCount = currentSeasonObj?.episodes?.length || currentSeasonObj?.episodeCount || recap?.episodes?.length || media.totalEpisodes || 12;
  const statusInfo = formatStatus(media.status);
  const seasonLabel = formatSeason(media.seasonPeriod, media.releaseYear);
  const hasExtraInfo = Boolean(
    (media.score != null && media.score > 0) ||
    statusInfo ||
    media.totalEpisodes ||
    media.durationMinutes ||
    seasonLabel ||
    (media.genres && media.genres.length > 0)
  );

  return (
    <div className="pb-28">
      {/* Banner Superior Panorâmico (Estilo AniList) */}
      <div className="relative w-full h-[260px] sm:h-[320px] md:h-[380px] bg-brand-card overflow-hidden">
        {media.backdropUrl ? (
          <img
            src={media.backdropUrl}
            alt={media.title}
            className="w-full h-full object-cover object-center"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-brand-purple/20 via-brand-dark to-brand-purple/10" />
        )}

        {/* Gradiente superior para contraste da barra de navegação */}
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />

        {/* Gradiente inferior suave para fusão com a página */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-brand-dark via-brand-dark/50 to-transparent pointer-events-none" />

        {/* Botão de Voltar sobre o banner */}
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 relative h-full flex items-start pt-24 pointer-events-none">
          <Link
            to="/"
            className="pointer-events-auto inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-white transition-all bg-black/60 hover:bg-black/85 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 shadow-xl hover:scale-105"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar à busca
          </Link>
        </div>
      </div>

      {/* Área de Detalhes da Obra com Pôster Sobreposto (Estilo AniList) */}
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 relative">
        <div className="flex flex-col md:flex-row items-start gap-6 lg:gap-8 -mt-20 sm:-mt-28 md:-mt-36">
          {/* Pôster com Sobreposição */}
          <div className="w-36 sm:w-48 md:w-56 lg:w-64 rounded-2xl overflow-hidden shadow-2xl border-2 border-brand-border/80 shrink-0 bg-brand-card z-10 group">
            {media.posterUrl ? (
              <img
                src={media.posterUrl}
                alt={media.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                <Film className="h-8 w-8" />
              </div>
            )}
          </div>

          {/* Informações Textuais e Metadados */}
          <div className="flex-1 min-w-0 w-full pt-1 md:pt-3 space-y-4">

            {/* Título Principal */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black italic tracking-tight text-white drop-shadow-md uppercase">
              {media.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                  variant={media.type === 'ANIME' ? 'anime' : 'series'}
                  className="text-xs px-2.5 py-0.5 uppercase"
              >
                {media.type}
              </Badge>
              {media.releaseYear && (
                  <Badge variant="outline" className="gap-1 text-xs border-brand-border bg-brand-card/80 text-gray-300">
                    <Calendar className="h-3 w-3" /> {media.releaseYear}
                  </Badge>
              )}
                {statusInfo && (
                    <Badge
                        variant="outline"
                        className={cn(
                            "text-xs font-semibold px-2.5 py-0.5 border shadow-sm backdrop-blur-sm",
                            statusInfo.isReleasing
                                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                                : "bg-blue-500/15 text-blue-400 border-blue-500/30"
                        )}
                    >
                        <span
                            className={cn(
                                "w-1.5 h-1.5 rounded-full mr-1.5 inline-block",
                                statusInfo.isReleasing ? "bg-emerald-400 animate-pulse" : "bg-blue-400"
                            )}
                        />
                        {statusInfo.label}
                    </Badge>
                )}

              {media.totalSeasons && media.totalSeasons > 1 && (
                  <Badge variant="outline" className="gap-1 text-xs border-brand-border bg-brand-card/80 text-gray-300">
                    <Layers className="h-3 w-3" /> {media.totalSeasons} Temporadas
                  </Badge>
              )}
            </div>

            {/* Linha com Sinopse na esquerda e Metadados na direita */}
            <div className="flex flex-col lg:flex-row gap-6 items-start justify-between w-full pt-1">
              <div className="flex-1 min-w-0 space-y-2">
                <p
                  ref={synopsisRef}
                  className={cn(
                    "text-sm sm:text-base text-gray-300 leading-relaxed font-light",
                    !isExpanded && "line-clamp-4 md:line-clamp-5"
                  )}
                >
                  {media.overview || 'Consulte os resumos detalhados por temporada e episódio abaixo.'}
                </p>

                {canExpand && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-brand-purple hover:text-brand-pink transition-colors cursor-pointer py-0.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-purple rounded"
                    aria-expanded={isExpanded}
                  >
                    <span>{isExpanded ? 'Ler menos' : 'Ler mais'}</span>
                    {isExpanded ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </button>
                )}
              </div>

              {/* Bloco de Metadados Adicionais */}
              {hasExtraInfo && (
                <div className="w-full lg:w-72 xl:w-80 shrink-0 space-y-3">
                  {/* Header: Nota / Avaliação & Status */}
                  <div className="flex items-center justify-between gap-3">
                    {media.score != null && media.score > 0 ? (
                      <div className="flex items-center gap-1.5" title={`Nota: ${media.score.toFixed(1)} / 10`}>
                        <Star className="h-4 w-4 text-amber-400 fill-amber-400 shrink-0" />
                        <span className="text-white font-bold text-base leading-none">
                          {media.score.toFixed(1)}
                        </span>
                        <span className="text-gray-400 text-xs font-light leading-none">/ 10</span>
                      </div>
                    ) : null}

                  </div>

                  {/* Grid de Metadados: Episódios, Duração, Estreia */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-2.5 pt-1">
                    {media.totalEpisodes ? (
                      <div className="space-y-0.5">
                        <span className="text-[10px] uppercase tracking-wider text-gray-400 flex items-center gap-1 font-medium">
                          <Tv className="h-3 w-3 text-brand-purple shrink-0" /> Episódios
                        </span>
                        <p className="text-sm font-semibold text-white">
                          {media.totalEpisodes}
                        </p>
                      </div>
                    ) : null}

                    {media.durationMinutes ? (
                      <div className="space-y-0.5">
                        <span className="text-[10px] uppercase tracking-wider text-gray-400 flex items-center gap-1 font-medium">
                          <Clock className="h-3 w-3 text-brand-purple shrink-0" /> Duração
                        </span>
                        <p className="text-sm font-semibold text-white">
                          {media.durationMinutes} min
                        </p>
                      </div>
                    ) : null}

                    {seasonLabel ? (
                      <div className="space-y-0.5 col-span-2 sm:col-span-1 lg:col-span-1">
                        <span className="text-[10px] uppercase tracking-wider text-gray-400 flex items-center gap-1 font-medium">
                          <Calendar className="h-3 w-3 text-brand-purple shrink-0" /> Estreia
                        </span>
                        <p className="text-sm font-semibold text-white truncate" title={seasonLabel}>
                          {seasonLabel}
                        </p>
                      </div>
                    ) : null}
                  </div>

                  {/* Lista de Gêneros */}
                  {media.genres && media.genres.length > 0 && (
                    <div className="pt-2 space-y-1.5">
                      <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium block">
                        Gêneros
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {media.genres.map((genre) => (
                          <Badge
                            key={genre}
                            variant="outline"
                            className="text-[11px] px-2.5 py-0.5 bg-black/40 backdrop-blur-sm border-brand-border/80 text-gray-300 font-normal hover:text-white hover:border-brand-purple/50 transition-colors"
                          >
                            {GENRE_MAP[genre] || genre}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal: Abas de Resumos e Episódios */}
      <main className="container max-w-7xl mx-auto px-4 sm:px-6 mt-8 space-y-8">
        <Tabs defaultValue="resumos" className="w-full space-y-8">
          {/* Navegação Principal das Abas da Obra */}
          <div className="pb-3">
            <TabsList className="bg-brand-card/90 backdrop-blur-md border border-brand-border p-1.5 rounded-2xl h-auto gap-2">
              <TabsTrigger
                value="resumos"
                className="text-sm sm:text-base font-semibold px-6 py-2.5 rounded-xl transition-all data-[state=active]:bg-brand-purple data-[state=active]:text-white data-[state=active]:shadow-lg cursor-pointer flex items-center gap-2.5"
              >
                <BookOpen className="h-4 w-4" />
                Resumos
              </TabsTrigger>
              <TabsTrigger
                value="episodios"
                className="text-sm sm:text-base font-semibold px-6 py-2.5 rounded-xl transition-all data-[state=active]:bg-brand-purple data-[state=active]:text-white data-[state=active]:shadow-lg cursor-pointer flex items-center gap-2.5"
              >
                <Tv className="h-4 w-4" />
                Episódios
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Aba 1: Resumos (conteúdo atual preservado integralmente) */}
          <TabsContent value="resumos" className="space-y-8 mt-0 focus-visible:outline-none">
            {/* Controle da Trava Anti-Spoiler */}
            <SpoilerLockController
              mediaKey={mediaKey}
              totalSeasons={media.totalSeasons || 1}
              episodesInCurrentSeason={episodesCount}
              currentSeason={selectedSeason}
              onSeasonChange={(s) => setSelectedSeason(s)}
            />

            {/* Seletor de Temporadas (Tabs) & Conteúdo */}
            {loadingRecap ? (
              <div className="p-16 text-center flex flex-col items-center justify-center space-y-3 bg-brand-card rounded-2xl border border-brand-border">
                <Loader2 className="h-8 w-8 animate-spin text-brand-purple" />
                <span className="text-sm text-gray-400 font-light">Sintetizando resumo inteligente da temporada...</span>
              </div>
            ) : recap ? (
              <Tabs defaultValue="overview" className="w-full space-y-6">
                <div className="flex items-center justify-between border-b border-brand-border/60 pb-4">
                  <TabsList className="bg-brand-card border border-brand-border p-1 rounded-full">
                    <TabsTrigger
                      value="overview"
                      className="text-xs sm:text-sm gap-2 rounded-full px-5 py-2 data-[state=active]:bg-brand-purple data-[state=active]:text-white font-medium"
                    >
                      Resumo Geral
                    </TabsTrigger>
                    <TabsTrigger
                      value="episodes"
                      className="text-xs sm:text-sm gap-2 rounded-full px-5 py-2 data-[state=active]:bg-brand-purple data-[state=active]:text-white font-medium"
                    >
                      <Layers className="h-4 w-4" /> Lista de Episódios
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="overview">
                  <SeasonRecapTab recap={recap} />
                </TabsContent>

                <TabsContent value="episodes">
                  <EpisodeAccordionList
                    mediaKey={mediaKey}
                    seasonNumber={selectedSeason}
                    episodes={
                      (currentSeasonObj?.episodes && currentSeasonObj.episodes.length > 0)
                        ? currentSeasonObj.episodes.map((ep) => ({
                            episodeNumber: ep.episodeNumber,
                            title: ep.title || `Episódio ${ep.episodeNumber}`,
                            summary: ep.synopsis || 'Sem sinopse disponível.',
                            keyEvents: [],
                          }))
                        : (recap.episodes || [])
                    }
                  />
                </TabsContent>
              </Tabs>
            ) : (
              <div className="p-12 text-center rounded-2xl bg-brand-card border border-brand-border text-sm text-gray-400">
                Nenhum resumo encontrado para esta temporada.
              </div>
            )}
          </TabsContent>

          {/* Aba 2: Episódios (número, thumb e título) */}
          <TabsContent value="episodios" className="space-y-6 mt-0 focus-visible:outline-none">
            <MediaEpisodesTab
              media={media}
              selectedSeason={selectedSeason}
              onSeasonChange={(s) => setSelectedSeason(s)}
              recapEpisodes={recap?.episodes}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Drawer de Chat Conversacional com IA */}
      <ChatDrawer
        mediaKey={mediaKey}
        mediaTitle={media.title}
        mediaType={media.type}
        externalId={media.externalId}
      />
    </div>
  );
};
