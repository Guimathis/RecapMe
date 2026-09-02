import React, { useEffect, useState } from 'react';
import { SearchBar } from '@/components/common/SearchBar';
import { cn } from '@/lib/utils';

interface HeroSectionProps {
  activeFilter?: string;
  onFilterChange?: (filter: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  activeFilter = 'ALL',
  onFilterChange,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(activeFilter);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleFilterClick = (filter: string) => {
    setSelectedFilter(filter);
    if (onFilterChange) {
      onFilterChange(filter);
    }
  };

  return (
    <section className="relative z-10 pt-28 md:pt-40 pb-16 px-4 flex flex-col items-center text-center max-w-6xl mx-auto">
      {/* Ambient Radial Glow on the Grid */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-purple/15 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Título Principal */}
      <h1
        className={cn(
          "text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold max-w-5xl leading-[1.1] tracking-tight mb-6 text-white transition-all duration-500",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        )}
      >
        Lançou nova temporada e <br className="hidden md:block" />
        você <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple via-pink-400 to-brand-pink">não lembra de nada?</span>
      </h1>

      {/* Subtítulo */}
      <p
        className={cn(
          "text-gray-400 text-base sm:text-lg md:text-xl max-w-2xl mb-10 font-light leading-relaxed transition-all duration-500 delay-100",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        )}
      >
        Consulte resumos estruturados por temporada e episódio, e converse com a IA com uma trava inteligente que impede spoilers do futuro da trama.
      </p>

      {/* Filtros Pílulas */}
      <div
        className={cn(
          "flex flex-wrap justify-center gap-2 md:gap-3 mb-10 transition-all duration-500 delay-200",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        )}
      >
        <button
          onClick={() => handleFilterClick('ALL')}
          className={cn(
            "px-5 py-2.5 rounded-full font-medium text-sm transition-all cursor-pointer",
            selectedFilter === 'ALL'
              ? "bg-brand-purple text-white glow-active scale-105"
              : "bg-brand-card border border-brand-border text-gray-300 hover:text-white hover:bg-gray-800"
          )}
        >
          Todos
        </button>
        <button
          onClick={() => handleFilterClick('SERIES')}
          className={cn(
            "px-5 py-2.5 rounded-full font-medium text-sm transition-all cursor-pointer",
            selectedFilter === 'SERIES'
              ? "bg-brand-purple text-white glow-active scale-105"
              : "bg-brand-card border border-brand-border text-gray-300 hover:text-white hover:bg-gray-800"
          )}
        >
          Séries
        </button>
        <button
          onClick={() => handleFilterClick('ANIME')}
          className={cn(
            "px-5 py-2.5 rounded-full font-medium text-sm transition-all cursor-pointer",
            selectedFilter === 'ANIME'
              ? "bg-brand-purple text-white glow-active scale-105"
              : "bg-brand-card border border-brand-border text-gray-300 hover:text-white hover:bg-gray-800"
          )}
        >
          Animes
        </button>
        <button
          onClick={() => handleFilterClick('MOVIE')}
          className={cn(
            "px-5 py-2.5 rounded-full font-medium text-sm transition-all cursor-pointer",
            selectedFilter === 'MOVIE'
              ? "bg-brand-purple text-white glow-active scale-105"
              : "bg-brand-card border border-brand-border text-gray-300 hover:text-white hover:bg-gray-800"
          )}
        >
          Filmes
        </button>
      </div>

      {/* Barra de Busca */}
      <div
        className={cn(
          "w-full transition-all duration-500 delay-300",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        )}
      >
        <SearchBar />
      </div>
    </section>
  );
};
