import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MediaItem } from '@/types/media';
import { MediaCard } from '@/components/media/MediaCard';
import { cn } from '@/lib/utils';

// Dados populares de fallback de alta qualidade caso a API esteja carregando
const FALLBACK_TRENDING: MediaItem[] = [
  {
    externalId: '1399',
    type: 'SERIES',
    source: 'TMDB',
    title: 'Game of Thrones',
    originalTitle: 'Game of Thrones',
    overview: 'Nove famílias nobres lutam pelo controle das terras místicas de Westeros.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/2OMB0ynKlyIenMJWI2Dy9IWT4c.jpg',
    releaseYear: 2011,
    totalSeasons: 8,
  },
  {
    externalId: '1429',
    type: 'ANIME',
    source: 'JIKAN',
    title: 'Attack on Titan',
    originalTitle: 'Shingeki no Kyojin',
    overview: 'A humanidade vive cercada por muralhas gigantescas para se proteger de titãs devoradores.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/hTP1DtLGFamjfu8WqjnuQdP1n4i.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/hPkWb89eTGB90N2a2m8j1hK5bF7.jpg',
    releaseYear: 2013,
    totalSeasons: 4,
  },
  {
    externalId: '94997',
    type: 'SERIES',
    source: 'TMDB',
    title: 'House of the Dragon',
    originalTitle: 'House of the Dragon',
    overview: 'A história da guerra civil da Casa Targaryen que ocorreu cerca de 200 anos antes de Game of Thrones.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/7QMsOTMUswlwxJP0rTTZfmz2tX2.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/etj5CuMuam30oZhVoYxSJ8bG85j.jpg',
    releaseYear: 2022,
    totalSeasons: 2,
  },
  {
    externalId: '94605',
    type: 'ANIME',
    source: 'JIKAN',
    title: 'Arcane',
    originalTitle: 'Arcane: League of Legends',
    overview: 'Em meio ao conflito entre as cidades-gêmeas de Piltover e Zaun, duas irmãs lutam em lados opostos.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/abf8tZvngYnaMG9ee0fbVIwdRFA.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/v5D0k11Q9Q5d5Lh1W5Yy7nJ5qR.jpg',
    releaseYear: 2021,
    totalSeasons: 2,
  },
  {
    externalId: '66732',
    type: 'SERIES',
    source: 'TMDB',
    title: 'Stranger Things',
    originalTitle: 'Stranger Things',
    overview: 'Quando um garoto desaparece, sua mãe, um chefe de polícia e seus amigos precisam enfrentar forças aterrorizantes.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/56v2KjBlU4XaOv9rVYEQypROD7P.jpg',
    releaseYear: 2016,
    totalSeasons: 4,
  },
  {
    externalId: '37854',
    type: 'ANIME',
    source: 'JIKAN',
    title: 'One Piece',
    originalTitle: 'One Piece',
    overview: 'Monkey D. Luffy recusa que nada fique no caminho de sua ambição de se tornar o Rei dos Piratas.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/fcXdJlbSdUEeMSJFsXKsznGwwok.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg',
    releaseYear: 1999,
    totalSeasons: 21,
  },
  {
    externalId: '1396',
    type: 'SERIES',
    source: 'TMDB',
    title: 'Breaking Bad',
    originalTitle: 'Breaking Bad',
    overview: 'Um professor de química do ensino médio diagnosticado com câncer de pulmão inoperável se volta para a fabricação de metanfetamina.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/original/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg',
    releaseYear: 2008,
    totalSeasons: 5,
  }
];

interface TrendingPeekCarouselProps {
  items?: MediaItem[];
  isLoading?: boolean;
}

export const TrendingPeekCarousel: React.FC<TrendingPeekCarouselProps> = ({
  items,
  isLoading = false,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const displayItems = items && items.length > 0 ? items : FALLBACK_TRENDING;
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

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

  return (
    <div className="w-full relative select-none scroll-mt-28 py-6" id="trending">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 px-1">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
          Animes e Séries em alta no Brasil
        </h2>

        {/* Navigation Arrows */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleScroll('left')}
            disabled={!canScrollLeft}
            className={cn(
              "p-2 rounded-full bg-brand-card border border-brand-border text-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
              canScrollLeft ? "hover:bg-brand-purple hover:border-brand-purple cursor-pointer shadow-lg active:scale-95" : "opacity-30 cursor-not-allowed"
            )}
            aria-label="Anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleScroll('right')}
            disabled={!canScrollRight}
            className={cn(
              "p-2 rounded-full bg-brand-card border border-brand-border text-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
              canScrollRight ? "hover:bg-brand-purple hover:border-brand-purple cursor-pointer shadow-lg active:scale-95" : "opacity-30 cursor-not-allowed"
            )}
            aria-label="Próximo"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Carrossel Horizontal com efeito Peek e tamanho proporcional às outras seções */}
      <div className="relative">
        <div
          ref={scrollRef}
          className="flex gap-4 md:gap-6 overflow-x-auto hide-scrollbar pb-4 pt-1 px-1 snap-x snap-mandatory transition-all"
        >
          {isLoading
            ? Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={`skeleton-${idx}`}
                  className="w-[160px] sm:w-[190px] md:w-[215px] lg:w-[227px] flex-shrink-0 snap-start aspect-[2/3] rounded-2xl bg-brand-card border border-brand-border animate-pulse"
                />
              ))
            : displayItems.map((item) => (
                <MediaCard
                  key={`trending-${item.type}-${item.externalId}`}
                  media={item}
                  className="w-[160px] sm:w-[190px] md:w-[215px] lg:w-[227px] flex-shrink-0 snap-start"
                />
              ))}
        </div>
      </div>
    </div>
  );
};
