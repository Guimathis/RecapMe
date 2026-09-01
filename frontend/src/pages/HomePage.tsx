import React, { useEffect, useState } from 'react';
import { History, Flame, Star } from 'lucide-react';
import { HeroSection } from '@/components/landing/HeroSection';
import { MediaCard } from '@/components/media/MediaCard';
import { useRecentStore } from '@/stores/useRecentStore';
import { MediaItem } from '@/types/media';
import { mediaService } from '@/services/mediaService';

export const HomePage: React.FC = () => {
  const { recents } = useRecentStore();
  const [popularMedias, setPopularMedias] = useState<MediaItem[]>([]);
  const [loadingPopular, setLoadingPopular] = useState(true);
  const [mostRatedMedias, setMostRatedMedias] = useState<MediaItem[]>([]);
  const [loadingMostRated, setLoadingMostRated] = useState(true);

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

    // Carregar mais bem avaliados
    const fetchMostRated = async () => {
      try {
        const breaking = await mediaService.search('Breaking Bad');
        const arcane = await mediaService.search('Arcane');
        const combined = [...(breaking.items || []), ...(arcane.items || [])].slice(0, 8);
        setMostRatedMedias(combined);
      } catch (e) {
        console.warn('Erro ao carregar mais bem avaliados:', e);
      } finally {
        setLoadingMostRated(false);
      }
    };

    fetchPopular();
    fetchMostRated();
  }, []);

  useEffect(() => {
    if (window.location.hash) {
      const hash = window.location.hash;
      if (hash === '#search-section' || hash === '#search') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => {
          const input = document.querySelector('#search-section input') as HTMLInputElement;
          if (input) input.focus();
        }, 400);
      } else {
        setTimeout(() => {
          const el = document.querySelector(hash);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }, 300);
      }
    }
  }, []);

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section Imersivo com Sneak Peek */}
      <HeroSection trendingItems={popularMedias} isLoadingTrending={loadingPopular} />

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
      <section className="container max-w-7xl mx-auto px-4 sm:px-8 scroll-mt-28" id="popular">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5 text-purple-400">
            <Flame className="h-5 w-5 text-orange-400" />
            <h2 className="text-xl font-bold text-foreground">Obras Populares para Recapitular</h2>
          </div>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            Séries, Animes & Filmes
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

      {/* Seção: Mais Bem Avaliados */}
      <section className="container max-w-7xl mx-auto px-4 sm:px-8 scroll-mt-28" id="most-rated">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5 text-yellow-400">
            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            <h2 className="text-xl font-bold text-foreground">Mais Bem Avaliados</h2>
          </div>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            Aclamados pela crítica e público
          </span>
        </div>

        {loadingMostRated ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="aspect-[2/3] rounded-2xl bg-muted/40 animate-pulse" />
            ))}
          </div>
        ) : mostRatedMedias.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {mostRatedMedias.map((item) => (
              <MediaCard key={`most-rated-${item.type}-${item.externalId}`} media={item} />
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl glass text-center text-sm text-muted-foreground">
            Nenhuma obra encontrada.
          </div>
        )}
      </section>
    </div>
  );
};
