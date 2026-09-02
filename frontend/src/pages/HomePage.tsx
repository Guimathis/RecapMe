import React, { useEffect, useState } from 'react';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturedHeroBanner } from '@/components/landing/FeaturedHeroBanner';
import { TrendingPeekCarousel } from '@/components/media/TrendingPeekCarousel';
import { MediaCard } from '@/components/media/MediaCard';
import { MediaItem } from '@/types/media';
import { mediaService } from '@/services/mediaService';

export const HomePage: React.FC = () => {
  const [popularMedias, setPopularMedias] = useState<MediaItem[]>([]);
  const [loadingPopular, setLoadingPopular] = useState(true);
  const [mostRatedMedias, setMostRatedMedias] = useState<MediaItem[]>([]);
  const [loadingMostRated, setLoadingMostRated] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  useEffect(() => {
    // Carregar destaques populares iniciais
    const fetchPopular = async () => {
      try {
        const data = await mediaService.search('Attack on Titan');
        const thrones = await mediaService.search('Game of Thrones');
        const solo = await mediaService.search('Solo Leveling');
        const combined = [
          ...(data.items || []),
          ...(thrones.items || []),
          ...(solo.items || []),
        ].slice(0, 10);
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
        const frieren = await mediaService.search('Frieren');
        const combined = [
          ...(breaking.items || []),
          ...(arcane.items || []),
          ...(frieren.items || []),
        ].slice(0, 10);
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

  const filterMedias = (items: MediaItem[]) => {
    if (activeFilter === 'ALL') return items;
    return items.filter((item) => item.type === activeFilter);
  };

  const filteredPopular = filterMedias(popularMedias);
  const filteredMostRated = filterMedias(mostRatedMedias);

  return (
    <div className="space-y-12 pb-24">
      {/* Hero Section Imersivo com Título, Pílulas de Filtro, Busca e Estatísticas */}
      <HeroSection
        activeFilter={activeFilter}
        onFilterChange={(filter) => setActiveFilter(filter)}
      />

      {/* Banner Destaque (Spotlight Hero Banner com Slider) */}
      <FeaturedHeroBanner items={popularMedias} />

      {/* Seção: Obras em Alta (Carrossel Horizontal com Snap) */}
      <section className="container max-w-7xl mx-auto px-4 sm:px-6">
        <TrendingPeekCarousel items={popularMedias} isLoading={loadingPopular} />
      </section>



      {/* Seção: Obras Populares para Recapitular */}
      <section className="container max-w-7xl mx-auto px-4 sm:px-6 scroll-mt-28" id="popular">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Obras Populares para Recapitular
          </h2>
        </div>

        {loadingPopular ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div
                key={idx}
                className="aspect-[2/3] rounded-2xl bg-brand-card border border-brand-border animate-pulse"
              />
            ))}
          </div>
        ) : filteredPopular.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {filteredPopular.map((item) => (
              <MediaCard key={`popular-${item.type}-${item.externalId}`} media={item} />
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-brand-card border border-brand-border text-center text-sm text-gray-400">
            Nenhuma obra encontrada para a categoria selecionada.
          </div>
        )}
      </section>

      {/* Seção: Mais Bem Avaliados */}
      <section className="container max-w-7xl mx-auto px-4 sm:px-6 scroll-mt-28" id="most-rated">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Mais Bem Avaliados de Todos os Tempos
          </h2>

        </div>

        {loadingMostRated ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div
                key={idx}
                className="aspect-[2/3] rounded-2xl bg-brand-card border border-brand-border animate-pulse"
              />
            ))}
          </div>
        ) : filteredMostRated.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {filteredMostRated.map((item) => (
              <MediaCard key={`most-rated-${item.type}-${item.externalId}`} media={item} />
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-brand-card border border-brand-border text-center text-sm text-gray-400">
            Nenhuma obra encontrada para esta categoria.
          </div>
        )}
      </section>
    </div>
  );
};
