import React, { useEffect, useState } from 'react';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturedHeroBanner } from '@/components/landing/FeaturedHeroBanner';
import { MediaCarouselSection } from '@/components/media/MediaCarouselSection';
import { MediaItem } from '@/types/media';
import { mediaService } from '@/services/mediaService';
import {
  MOCK_TRENDING_MEDIAS,
  MOCK_POPULAR_MEDIAS,
  MOCK_TOP_RATED_MEDIAS,
} from '@/mocks/homeSectionsMocks';

/**
 * Configuração declarativa das seções da Home.
 * Para alterar as obras exibidas em uma seção ou adicionar novas seções,
 * basta modificar ou incluir itens nesta lista alterando o `endpoint`.
 */
export interface HomeSectionConfig {
  id: string;
  title: string;
  endpoint: string;
  fallback: MediaItem[];
}

export const HOME_SECTIONS_CONFIG: HomeSectionConfig[] = [
  {
    id: 'trending',
    title: 'Animes e Séries em alta no Brasil',
    endpoint: '/api/v1/medias/trending',
    fallback: MOCK_TRENDING_MEDIAS,
  },
  {
    id: 'popular',
    title: 'Obras Populares para Recapitular',
    endpoint: '/api/v1/medias/popular',
    fallback: MOCK_POPULAR_MEDIAS,
  },
  {
    id: 'most-rated',
    title: 'Mais Bem Avaliados',
    endpoint: '/api/v1/medias/top-rated',
    fallback: MOCK_TOP_RATED_MEDIAS,
  },
];

export const HomePage: React.FC = () => {
  const [sectionsData, setSectionsData] = useState<
    Record<string, { items: MediaItem[]; loading: boolean }>
  >(() =>
    HOME_SECTIONS_CONFIG.reduce(
      (acc, s) => ({ ...acc, [s.id]: { items: [], loading: true } }),
      {}
    )
  );

  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  useEffect(() => {
    // Carregamento dinâmico de cada seção configurada
    HOME_SECTIONS_CONFIG.forEach(async (section) => {
      try {
        const items = await mediaService.getByEndpoint(section.endpoint);
        setSectionsData((prev) => ({
          ...prev,
          [section.id]: { items, loading: false },
        }));
      } catch (e) {
        console.warn(
          `[HomePage] Falha ao carregar endpoint ${section.endpoint}, utilizando fallback mock:`,
          e
        );
        setSectionsData((prev) => ({
          ...prev,
          [section.id]: { items: [], loading: false },
        }));
      }
    });
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

  const trendingItems = sectionsData['trending']?.items || [];
  const heroBannerItems =
    trendingItems.length > 0 ? trendingItems : MOCK_TRENDING_MEDIAS;

  return (
    <div className="space-y-12 pb-24">
      {/* Hero Section Imersivo com Título, Pílulas de Filtro e Busca */}
      <HeroSection
        activeFilter={activeFilter}
        onFilterChange={(filter) => setActiveFilter(filter)}
      />

      {/* Banner Destaque (Spotlight Hero Banner com Slider) */}
      <FeaturedHeroBanner items={heroBannerItems} />

      {/* Seções de Categorias Configuradas Declarativamente */}
      {HOME_SECTIONS_CONFIG.map((section) => (
        <section
          key={section.id}
          className="container max-w-7xl mx-auto px-4 sm:px-6"
        >
          <MediaCarouselSection
            id={section.id}
            title={section.title}
            items={sectionsData[section.id]?.items}
            fallbackItems={section.fallback}
            isLoading={sectionsData[section.id]?.loading}
            activeFilter={activeFilter}
          />
        </section>
      ))}
    </div>
  );
};
