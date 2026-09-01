import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, Film, Loader2, Calendar, Layers } from 'lucide-react';
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
      <div className="container max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
        <p className="text-sm text-muted-foreground">Carregando detalhes e sincronizando metadados...</p>
      </div>
    );
  }

  if (error || !media) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-foreground">Obra não encontrada</h2>
        <p className="text-sm text-muted-foreground">{error || 'Não foi possível obter os dados desta obra.'}</p>
        <Link to="/">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Voltar para a Home
          </Button>
        </Link>
      </div>
    );
  }

  const episodesCount = recap?.episodes?.length || 10;

  return (
    <div className="pb-24">
      {/* Backdrop Header com Degradê */}
      <div className="relative w-full min-h-[360px] md:min-h-[420px] bg-card overflow-hidden">
        {media.backdropUrl ? (
          <img
            src={media.backdropUrl}
            alt={media.title}
            className="w-full h-full object-cover object-center filter brightness-[0.35] blur-[1px] absolute inset-0"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-purple-950/40 via-background to-background absolute inset-0" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />

        <div className="container max-w-7xl mx-auto px-4 sm:px-8 relative pt-24 pb-12 flex flex-col justify-between min-h-[400px] md:min-h-[460px]">
          {/* Botão de Voltar */}
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-white transition-colors bg-background/50 hover:bg-background/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-border/40"
            >
              <ArrowLeft className="h-4 w-4" /> Voltar à busca
            </Link>
          </div>

          {/* Card Principal da Obra */}
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6 mt-6">
            {/* Pôster */}
            <div className="w-32 sm:w-44 md:w-52 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border-2 border-border/60 shrink-0 bg-muted/40 group">
              {media.posterUrl ? (
                <img src={media.posterUrl} alt={media.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <Film className="h-8 w-8" />
                </div>
              )}
            </div>

            {/* Informações Textuais */}
            <div className="space-y-3 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={media.type === 'ANIME' ? 'warning' : 'default'} className="uppercase font-bold text-xs">
                  {media.type}
                </Badge>
                {media.releaseYear && (
                  <Badge variant="outline" className="gap-1 text-xs">
                    <Calendar className="h-3 w-3" /> {media.releaseYear}
                  </Badge>
                )}
                {media.totalSeasons && media.totalSeasons > 1 && (
                  <Badge variant="outline" className="gap-1 text-xs">
                    <Layers className="h-3 w-3" /> {media.totalSeasons} Temporadas
                  </Badge>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                {media.title}
              </h1>

              {media.originalTitle && media.originalTitle !== media.title && (
                <p className="text-sm sm:text-base text-muted-foreground font-medium">
                  {media.originalTitle}
                </p>
              )}

              <p className="text-xs sm:text-sm text-slate-300 line-clamp-3 leading-relaxed max-w-2xl">
                {media.overview || 'Sinopse oficial não fornecida para esta obra.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal e Abas de Resumo */}
      <main className="container max-w-7xl mx-auto px-4 sm:px-8 mt-6 space-y-8">
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
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
            <span className="text-xs text-muted-foreground">Sintetizando resumo da temporada...</span>
          </div>
        ) : recap ? (
          <Tabs defaultValue="overview" className="w-full">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <TabsList className="bg-muted/40 p-1">
                <TabsTrigger value="overview" className="text-xs sm:text-sm gap-1.5">
                  <Sparkles className="h-4 w-4 text-purple-400" /> Resumo Geral da Temporada
                </TabsTrigger>
                <TabsTrigger value="episodes" className="text-xs sm:text-sm gap-1.5">
                  <Layers className="h-4 w-4 text-indigo-400" /> Lista de Episódios
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
          <div className="p-12 text-center rounded-2xl glass text-sm text-muted-foreground">
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
