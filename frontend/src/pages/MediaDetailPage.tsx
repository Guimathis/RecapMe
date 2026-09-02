import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Film, Loader2, Calendar, Layers } from 'lucide-react';
import { mediaService } from '@/services/mediaService';
import { recapService } from '@/services/recapService';
import { MediaDetail, MediaType } from '@/types/media';
import { SeasonRecap } from '@/types/recap';
import { useRecentStore } from '@/stores/useRecentStore';
import { useSpoilerStore } from '@/stores/useSpoilerStore';
import { SpoilerLockController } from '@/components/media/SpoilerLockController';
import { SeasonRecapTab } from '@/components/recap/SeasonRecapTab';
import { EpisodeAccordionList } from '@/components/recap/EpisodeAccordionList';
import { ChatDrawer } from '@/components/chat/ChatDrawer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const MediaDetailPage: React.FC = () => {
  const { type, id } = useParams<{ type: string; id: string }>();
  const mediaType = (type?.toUpperCase() as MediaType) || 'SERIES';
  const externalId = id || '';
  const mediaKey = `${mediaType}-${externalId}`;

  const { addRecent } = useRecentStore();
  const { progressByMedia, setProgress } = useSpoilerStore();

  const [media, setMedia] = useState<MediaDetail | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [recap, setRecap] = useState<SeasonRecap | null>(null);
  const [loadingMedia, setLoadingMedia] = useState<boolean>(true);
  const [loadingRecap, setLoadingRecap] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
      if (!externalId) return;
      setLoadingRecap(true);
      try {
        const recapData = await recapService.getSeasonRecap(mediaType, externalId, selectedSeason);
        setRecap(recapData);
      } catch (err: any) {
        console.warn('Erro ao carregar resumo da temporada:', err);
      } finally {
        setLoadingRecap(false);
      }
    };
    fetchRecap();
  }, [mediaType, externalId, selectedSeason]);

  if (loadingMedia) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-32 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-brand-purple" />
        <p className="text-sm text-gray-400">Carregando detalhes e sincronizando metadados...</p>
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

  const episodesCount = recap?.episodes?.length || 12;

  return (
    <div className="pb-28">
      {/* Backdrop Header com Degradê Cinematográfico */}
      <div className="relative w-full min-h-[420px] md:min-h-[500px] bg-brand-card overflow-hidden border-b border-brand-border/60">
        {media.backdropUrl ? (
          <img
            src={media.backdropUrl}
            alt={media.title}
            className="w-full h-full object-cover object-center filter brightness-[0.4] blur-[1px] absolute inset-0"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-brand-purple/20 via-brand-dark to-brand-dark absolute inset-0" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/60 to-transparent" />

        <div className="container max-w-7xl mx-auto px-4 sm:px-6 relative pt-28 pb-12 flex flex-col justify-between min-h-[420px] md:min-h-[500px]">
          {/* Botão de Voltar */}
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-300 hover:text-white transition-colors bg-brand-card/80 hover:bg-brand-card backdrop-blur-md px-4 py-2 rounded-full border border-brand-border shadow-lg"
            >
              <ArrowLeft className="h-4 w-4" /> Voltar à busca
            </Link>
          </div>

          {/* Card Principal da Obra */}
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6 mt-6">
            {/* Pôster */}
            <div className="w-32 sm:w-44 md:w-56 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border-2 border-brand-border shrink-0 bg-brand-card group">
              {media.posterUrl ? (
                <img src={media.posterUrl} alt={media.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  <Film className="h-8 w-8" />
                </div>
              )}
            </div>

            {/* Informações Textuais */}
            <div className="space-y-3 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant={media.type === 'ANIME' ? 'anime' : 'series'}
                  className="text-xs px-2.5 py-0.5"
                >
                  {media.type}
                </Badge>
                {media.releaseYear && (
                  <Badge variant="outline" className="gap-1 text-xs border-brand-border bg-brand-card/80 text-gray-300">
                    <Calendar className="h-3 w-3" /> {media.releaseYear}
                  </Badge>
                )}
                {media.totalSeasons && media.totalSeasons > 1 && (
                  <Badge variant="outline" className="gap-1 text-xs border-brand-border bg-brand-card/80 text-gray-300">
                    <Layers className="h-3 w-3" /> {media.totalSeasons} Temporadas
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black italic tracking-tight text-white drop-shadow-md uppercase">
                {media.title}
              </h1>

              {media.originalTitle && media.originalTitle !== media.title && (
                <p className="text-base sm:text-lg text-brand-purple font-bold">
                  {media.originalTitle}
                </p>
              )}

              <p className="text-xs sm:text-sm text-gray-300 line-clamp-3 md:line-clamp-4 leading-relaxed max-w-2xl font-light">
                {media.overview || 'Consulte os resumos detalhados por temporada e episódio abaixo.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal e Abas de Resumo */}
      <main className="container max-w-7xl mx-auto px-4 sm:px-6 mt-8 space-y-8">
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
                episodes={recap.episodes || []}
              />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="p-12 text-center rounded-2xl bg-brand-card border border-brand-border text-sm text-gray-400">
            Nenhum resumo encontrado para esta temporada.
          </div>
        )}
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
