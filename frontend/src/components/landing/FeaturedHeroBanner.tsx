import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Bookmark, ChevronLeft, ChevronRight } from 'lucide-react';
import { MediaItem } from '@/types/media';
import { Button } from '@/components/ui/button';

interface FeaturedHeroBannerProps {
  items?: MediaItem[];
}

const DEFAULT_FEATURED: Array<{
  id: string;
  type: string;
  title: string;
  subtitle: string;
  rating: string;
  audio: string;
  genres: string;
  overview: string;
  bannerUrl: string;
}> = [
  {
    id: '166610',
    type: 'ANIME',
    title: 'SOLO LEVELING',
    subtitle: 'Arise from the Shadows',
    rating: 'A16',
    audio: 'Leg | Dub',
    genres: 'Ação, Fantasia, Sobrenatural',
    overview: 'Em um mundo onde caçadores despertam poderes para combater monstros mortais, Sung Jinwoo, o caçador mais fraco de toda a humanidade, se encontra à beira da morte em uma masmorra dupla e descobre um sistema que só ele pode ver.',
    bannerUrl: 'https://image.tmdb.org/t/p/original/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg',
  },
  {
    id: '1429',
    type: 'ANIME',
    title: 'ATTACK ON TITAN',
    subtitle: 'Final Season: The Battle for Humanity',
    rating: 'A16',
    audio: 'Leg | Dub',
    genres: 'Ação, Drama, Mistério',
    overview: 'Após anos lutando pela sobrevivência atrás de muralhas colossais, Eren Jaeger e seus companheiros descobrem a verdade sobre o mundo exterior e os segredos milenares dos Titãs.',
    bannerUrl: 'https://image.tmdb.org/t/p/original/hPkWb89eTGB90N2a2m8j1hK5bF7.jpg',
  },
  {
    id: '94605',
    type: 'ANIME',
    title: 'ARCANE',
    subtitle: 'League of Legends — Temporada 2',
    rating: 'A16',
    audio: 'Leg | Dub',
    genres: 'Ação, Sci-Fi, Fantasia',
    overview: 'A rivalidade entre as cidades de Piltover e Zaun explode em guerra total com a invenção da tecnologia Hextech e a droga Shimmer, colocando duas irmãs em caminhos opostos e trágicos.',
    bannerUrl: 'https://image.tmdb.org/t/p/original/v5D0k11Q9Q5d5Lh1W5Yy7nJ5qR.jpg',
  },
  {
    id: '1399',
    type: 'SERIES',
    title: 'GAME OF THRONES',
    subtitle: 'Winter is Coming',
    rating: 'A18',
    audio: 'Leg | Dub',
    genres: 'Fantasia, Drama, Aventura',
    overview: 'Sete reinos nobres travam uma guerra mortal pelo Trono de Ferro de Westeros, enquanto uma antiga ameaça sobrenatural desperta no Norte além da Muralha.',
    bannerUrl: 'https://image.tmdb.org/t/p/original/2OMB0ynKlyIenMJWI2Dy9IWT4c.jpg',
  },
];

export const FeaturedHeroBanner: React.FC<FeaturedHeroBannerProps> = ({ items }) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [bookmarked, setBookmarked] = useState<Record<string, boolean>>({});

  const displayList = items && items.length > 0
    ? items.slice(0, 5).map((item, idx) => ({
        id: item.externalId || item.id || `featured-${idx}`,
        type: item.type || 'ANIME',
        title: item.title || 'Sem título',
        subtitle: item.originalTitle && item.originalTitle !== item.title ? item.originalTitle : 'Recapitulação sem Spoilers',
        rating: 'A16',
        audio: 'Leg | Dub',
        genres: item.type === 'ANIME' ? 'Anime, Ação, Aventura' : 'Série, Drama',
        overview: item.overview || 'Consulte resumos estruturados por temporada e episódio, e converse com a IA.',
        bannerUrl: item.backdropUrl || item.posterUrl || DEFAULT_FEATURED[idx % DEFAULT_FEATURED.length].bannerUrl,
      }))
    : DEFAULT_FEATURED;

  const current = displayList[currentIndex] || displayList[0];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % displayList.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + displayList.length) % displayList.length);
  };

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-8 relative z-10">
      {/* Banner Destaque */}
      <div className="relative w-full h-[480px] md:h-[560px] rounded-3xl overflow-hidden group border border-brand-border bg-brand-card shadow-2xl">
        {/* Background Image */}
        <img
          src={current.bannerUrl}
          alt={current.title}
          className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://image.tmdb.org/t/p/original/2OMB0ynKlyIenMJWI2Dy9IWT4c.jpg';
          }}
        />

        {/* Gradients para escurecer lado esquerdo e base */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/85 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent" />

        {/* Conteúdo do Banner */}
        <div className="absolute inset-y-0 left-0 flex flex-col justify-center p-8 md:p-16 w-full md:w-2/3 z-10">
          {/* Logo / Título */}
          <div className="mb-4">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black italic tracking-tighter text-white drop-shadow-lg uppercase line-clamp-2">
              {current.title}
            </h2>
            <h3 className="text-lg md:text-2xl font-bold text-brand-purple mt-1 drop-shadow-md line-clamp-1">
              {current.subtitle}
            </h3>
          </div>

          {/* Meta Info */}
          <div className="flex items-center gap-3 text-xs md:text-sm text-gray-300 mb-6 font-medium">
            <span className="bg-red-600 text-white px-2 py-0.5 rounded text-xs font-bold">
              {current.rating}
            </span>
            <span>•</span>
            <span>{current.audio}</span>
            <span>•</span>
            <span className="text-gray-300">{current.genres}</span>
          </div>

          {/* Sinopse */}
          <p className="text-gray-300 text-sm md:text-base max-w-xl mb-8 line-clamp-3 md:line-clamp-4 leading-relaxed font-light">
            {current.overview}
          </p>

          {/* Botões */}
          <div className="flex items-center gap-4">
            <Button
              variant="orange"
              size="lg"
              onClick={() => navigate(`/media/${current.type}/${current.id}`)}
              className="h-auto py-3.5 px-7 rounded-xl flex items-center gap-2.5 transition-all shadow-lg hover:scale-105"
            >
              <Play className="h-5 w-5 fill-white" /> COMEÇAR A RECAPITULAR E1
            </Button>
            <button
              onClick={(e) => toggleBookmark(current.id, e)}
              className="border border-gray-500 hover:border-white text-white p-3.5 rounded-xl transition-colors bg-black/40 backdrop-blur cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              title="Salvar na lista"
              aria-label="Salvar na lista"
            >
              <Bookmark
                className={`h-5 w-5 ${
                  bookmarked[current.id] ? 'fill-white text-white' : 'text-gray-300'
                }`}
              />
            </button>
          </div>

          {/* Indicadores (Dots) */}
          <div className="flex items-center gap-2 mt-8 md:mt-10">
            {displayList.map((item, idx) => (
              <button
                key={`dot-${item.id}-${idx}`}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Slide ${idx + 1}`}
                className={`h-1.5 transition-all duration-300 rounded-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  idx === currentIndex ? 'w-8 bg-brand-orange' : 'w-4 bg-gray-600 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Controle do Slider (Setas) */}
        <div className="absolute inset-y-0 right-4 hidden md:flex items-center z-20">
          <button
            onClick={handleNext}
            aria-label="Próximo"
            className="bg-black/50 hover:bg-black p-3 rounded-full backdrop-blur border border-white/10 text-white transition-all hover:scale-110 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
        <div className="absolute inset-y-0 left-4 hidden md:flex items-center z-20">
          <button
            onClick={handlePrev}
            aria-label="Anterior"
            className="bg-black/50 hover:bg-black p-3 rounded-full backdrop-blur border border-white/10 text-white transition-all hover:scale-110 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        </div>
      </div>
    </section>
  );
};
