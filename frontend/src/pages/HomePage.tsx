import React, { useEffect, useState } from 'react';
import { Sparkles, History, Flame } from 'lucide-react';
import { SearchBar } from '@/components/common/SearchBar';
import { MediaCard } from '@/components/media/MediaCard';
import { useRecentStore } from '@/stores/useRecentStore';
import { MediaItem } from '@/types/media';
import { mediaService } from '@/services/mediaService';

export const HomePage: React.FC = () => {
  const { recents } = useRecentStore();
  const [popularMedias, setPopularMedias] = useState<MediaItem[]>([]);
  const [loadingPopular, setLoadingPopular] = useState(true);

  useEffect(() => {
    // Carregar destaques populares iniciais
    const fetchPopular = async () => {
      try {
        const data = await mediaService.search('Attack on Titan');
        const thrones = await mediaService.search('Game of Thrones');
        const combined = [...(data.items || []), ...(thrones.items || [])].slice(0, 8);
        setPopularMedias(combined);
      } catch (e) {
        console.warn('Erro ao carregar populares:', e);
      } finally {
        setLoadingPopular(false);
      }
    };
    fetchPopular();
  }, []);

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 pb-8 text-center px-4">
        {/* Glow de fundo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-600/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5 text-purple-400 animate-spin" />
            <span>Recapitule suas obras favoritas sem risco de spoilers</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground">
            Lançou nova temporada e você{' '}
            <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-pink-400 bg-clip-text text-transparent">
              não lembra de nada?
            </span>
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Consulte resumos estruturados por temporada e episódio, e converse com a IA com uma trava inteligente que impede spoilers do futuro da trama.
          </p>

          <div className="pt-4">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Seção: Obras Recentes / Continuar de Onde Parou */}
      {recents.length > 0 && (
        <section className="container max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex items-center gap-2.5 mb-5 text-purple-400">
            <History className="h-5 w-5" />
            <h2 className="text-xl font-bold text-foreground">Continuar de Onde Parou</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {recents.map((item) => (
              <MediaCard key={`recent-${item.type}-${item.externalId}`} media={item} />
            ))}
          </div>
        </section>
      )}

      {/* Seção: Obras em Destaque */}
      <section className="container max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5 text-purple-400">
            <Flame className="h-5 w-5 text-orange-400" />
            <h2 className="text-xl font-bold text-foreground">Obras em Alta para Recapitular</h2>
          </div>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            Séries & Animes populares
          </span>
        </div>

        {loadingPopular ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="aspect-[2/3] rounded-2xl bg-muted/40 animate-pulse" />
            ))}
          </div>
        ) : popularMedias.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {popularMedias.map((item) => (
              <MediaCard key={`popular-${item.type}-${item.externalId}`} media={item} />
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl glass text-center text-sm text-muted-foreground">
            Use a barra de pesquisa acima para encontrar qualquer anime, série ou filme!
          </div>
        )}
      </section>
    </div>
  );
};
