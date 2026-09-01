import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Film, Tv, Sparkles } from 'lucide-react';
import { MediaItem } from '@/types/media';
import { Badge } from '@/components/ui/badge';
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

const TrendingCard: React.FC<{ item: MediaItem }> = ({ item }) => {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);

  return (
    <div
      onClick={() => navigate(`/media/${item.type}/${item.externalId}`)}
      className="flex-shrink-0 w-36 sm:w-44 md:w-48 group cursor-pointer snap-start relative rounded-2xl overflow-hidden bg-black/40 border border-white/10 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 transform hover:-translate-y-1.5"
    >
      {/* Poster Image */}
      <div className="aspect-[2/3] w-full overflow-hidden relative bg-neutral-900">
        {!imgError && item.posterUrl ? (
          <img
            src={item.posterUrl}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-gradient-to-br from-neutral-800 to-neutral-950 text-white/50">
            {item.type === 'ANIME' ? (
              <Sparkles className="h-8 w-8 text-pink-400/60 mb-2" />
            ) : (
              <Film className="h-8 w-8 text-purple-400/60 mb-2" />
            )}
            <span className="text-xs font-semibold text-white/70 line-clamp-2">{item.title}</span>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
          <Badge
            variant="outline"
            className="text-[10px] uppercase font-bold py-0.5 px-2 bg-black/60 backdrop-blur-md border-white/20 text-white"
          >
            {item.type === 'ANIME' ? (
              <span className="flex items-center gap-1">
                <Sparkles className="h-2.5 w-2.5 text-pink-400" /> Anime
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Tv className="h-2.5 w-2.5 text-purple-400" /> Série
              </span>
            )}
          </Badge>
          {item.releaseYear && (
            <span className="text-[11px] font-mono font-medium text-white/80 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded-md border border-white/10">
              {item.releaseYear}
            </span>
          )}
        </div>

        {/* Bottom Title & Details */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5">
          <h3 className="text-sm font-bold text-white leading-tight truncate group-hover:text-purple-300 transition-colors">
            {item.title}
          </h3>
          <div className="flex items-center justify-between mt-1 text-[11px] text-white/60">
            <span>{item.totalSeasons ? `${item.totalSeasons} Temporadas` : 'Resumos IA'}</span>
            <span className="text-purple-400 font-semibold group-hover:underline">Ver ➔</span>
          </div>
        </div>
      </div>
    </div>
  );
};

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
      const scrollAmount = direction === 'left' ? -350 : 350;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const maskStyle = useMemo(() => {
    if (canScrollLeft && canScrollRight) {
      return {
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 36px, black calc(100% - 64px), transparent 100%)',
        maskImage: 'linear-gradient(to right, transparent 0%, black 36px, black calc(100% - 64px), transparent 100%)',
      };
    }
    if (!canScrollLeft && canScrollRight) {
      return {
        WebkitMaskImage: 'linear-gradient(to right, black calc(100% - 72px), transparent 100%)',
        maskImage: 'linear-gradient(to right, black calc(100% - 72px), transparent 100%)',
      };
    }
    if (canScrollLeft && !canScrollRight) {
      return {
        WebkitMaskImage: 'linear-gradient(to left, black calc(100% - 40px), transparent 100%)',
        maskImage: 'linear-gradient(to left, black calc(100% - 40px), transparent 100%)',
      };
    }
    return {};
  }, [canScrollLeft, canScrollRight]);

  return (
    <div className="w-full relative select-none scroll-mt-28" id="trending">
      {/* Header do Sneak Peek */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2.5">
          <div>
            <h2 className="text-lg md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Em alta
            </h2>
          </div>
        </div>

        {/* Navigation Arrows */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleScroll('left')}
            disabled={!canScrollLeft}
            className={cn(
              "p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 transition-all",
              canScrollLeft ? "hover:bg-white/10 hover:text-white cursor-pointer" : "opacity-30 cursor-not-allowed"
            )}
            aria-label="Anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleScroll('right')}
            disabled={!canScrollRight}
            className={cn(
              "p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 transition-all",
              canScrollRight ? "hover:bg-white/10 hover:text-white cursor-pointer" : "opacity-30 cursor-not-allowed"
            )}
            aria-label="Próximo"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Carrossel Horizontal com efeito Peek e máscara de fade suave */}
      <div className="relative">
        {/* Side fade overlays for extra depth */}
        <div
          className={cn(
            "pointer-events-none absolute left-0 top-0 bottom-0 w-8 sm:w-14 bg-gradient-to-r from-black/90 via-black/40 to-transparent z-20 transition-opacity duration-300",
            canScrollLeft ? "opacity-100" : "opacity-0"
          )}
        />
        <div
          className={cn(
            "pointer-events-none absolute right-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-l from-black/90 via-black/40 to-transparent z-20 transition-opacity duration-300",
            canScrollRight ? "opacity-100" : "opacity-0"
          )}
        />

        <div
          ref={scrollRef}
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            ...maskStyle,
          }}
          className="flex gap-4 overflow-x-auto scrollbar-none pb-3 pt-1 px-1 snap-x snap-mandatory transition-all"
        >
          {isLoading
            ? Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={`skeleton-${idx}`}
                  className="flex-shrink-0 w-36 sm:w-44 md:w-48 aspect-[2/3] rounded-2xl bg-white/5 animate-pulse border border-white/10"
                />
              ))
            : displayItems.map((item) => (
                <TrendingCard
                  key={`trending-${item.type}-${item.externalId}`}
                  item={item}
                />
              ))}
        </div>
      </div>
    </div>
  );
};
