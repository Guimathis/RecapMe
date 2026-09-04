import React from 'react';
import { MediaItem } from '@/types/media';
import { MediaCarouselSection } from './MediaCarouselSection';
import { MOCK_TRENDING_MEDIAS } from '@/mocks/homeSectionsMocks';

// Exportado para retrocompatibilidade com testes e documentação
export const FALLBACK_TRENDING = MOCK_TRENDING_MEDIAS;

interface TrendingPeekCarouselProps {
  items?: MediaItem[];
  isLoading?: boolean;
  activeFilter?: string;
}

export const TrendingPeekCarousel: React.FC<TrendingPeekCarouselProps> = ({
  items,
  isLoading = false,
  activeFilter = 'ALL',
}) => {
  return (
    <MediaCarouselSection
      id="trending"
      title="Animes e Séries em alta no Brasil"
      items={items}
      fallbackItems={MOCK_TRENDING_MEDIAS}
      isLoading={isLoading}
      activeFilter={activeFilter}
    />
  );
};
