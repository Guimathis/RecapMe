import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MediaItem } from '@/types/media';
import { MediaCard } from '@/components/media/MediaCard';
import { cn } from '@/lib/utils';

export interface MediaCarouselSectionProps {
  id?: string;
  title: string;
  items?: MediaItem[];
  fallbackItems: MediaItem[];
  isLoading?: boolean;
  activeFilter?: string;
  className?: string;
}

export const MediaCarouselSection: React.FC<MediaCarouselSectionProps> = ({
  id,
  title,
  items,
  fallbackItems,
  isLoading = false,
  activeFilter = 'ALL',
  className,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Determinar itens base (dados da API ou mock de fallback)
  const baseItems = items && items.length > 0 ? items : fallbackItems;

  // Filtrar de acordo com o activeFilter se aplicável
  const displayItems =
    activeFilter && activeFilter !== 'ALL'
      ? baseItems.filter((item) => item.type === activeFilter)
      : baseItems;

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const ref = scrollRef.current;
    if (ref) {
      ref.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        ref.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [displayItems, isLoading]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const cardEl = scrollRef.current.querySelector('.snap-start') as HTMLElement;
      const cardWidth = cardEl ? cardEl.offsetWidth + 24 : 240;
      const scrollAmount = direction === 'left' ? -cardWidth * 2 : cardWidth * 2;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const hasItems = displayItems.length > 0;

  return (
    <div
      className={cn('w-full relative select-none scroll-mt-28 py-2', className)}
      id={id}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
          {title}
        </h2>

        {/* Navigation Arrows */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleScroll('left')}
            disabled={!canScrollLeft || !hasItems}
            className={cn(
              'p-2 rounded-full bg-brand-card border border-brand-border text-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background',
              canScrollLeft && hasItems
                ? 'hover:bg-brand-purple hover:border-brand-purple cursor-pointer shadow-lg active:scale-95'
                : 'opacity-30 cursor-not-allowed'
            )}
            aria-label="Anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleScroll('right')}
            disabled={!canScrollRight || !hasItems}
            className={cn(
              'p-2 rounded-full bg-brand-card border border-brand-border text-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background',
              canScrollRight && hasItems
                ? 'hover:bg-brand-purple hover:border-brand-purple cursor-pointer shadow-lg active:scale-95'
                : 'opacity-30 cursor-not-allowed'
            )}
            aria-label="Próximo"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Carrossel Horizontal com efeito Peek e snap */}
      <div className="relative">
        {isLoading ? (
          <div className="flex gap-4 md:gap-6 overflow-x-auto hide-scrollbar pt-4 pb-8 px-4 -mx-4 snap-x snap-mandatory">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={`skeleton-${id || 'section'}-${idx}`}
                className="w-[160px] sm:w-[190px] md:w-[215px] lg:w-[227px] flex-shrink-0 snap-start aspect-[2/3] rounded-2xl bg-brand-card border border-brand-border animate-pulse"
              />
            ))}
          </div>
        ) : hasItems ? (
          <div
            ref={scrollRef}
            className="flex gap-4 md:gap-6 overflow-x-auto hide-scrollbar pt-4 pb-8 px-4 -mx-4 snap-x snap-mandatory transition-all"
          >
            {displayItems.map((item, idx) => (
              <MediaCard
                key={`${id || 'carousel'}-${item.type || 'media'}-${item.externalId || item.id || idx}`}
                media={item}
                className="w-[160px] sm:w-[190px] md:w-[215px] lg:w-[227px] flex-shrink-0 snap-start"
              />
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-brand-card border border-brand-border text-center text-sm text-gray-400">
            Nenhuma obra encontrada para esta categoria.
          </div>
        )}
      </div>
    </div>
  );
};
