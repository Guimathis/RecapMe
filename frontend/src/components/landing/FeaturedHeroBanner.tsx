import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Bot,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Star,
  Layers,
} from 'lucide-react';
import { MediaItem } from '@/types/media';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface FeaturedHeroBannerProps {
  items?: MediaItem[];
}

interface FeaturedItem {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  kicker: string;
  seasonsCount?: number;
  episodesCount?: number;
  score?: number;
  genres: string;
  overview: string;
  bannerUrl: string;
}

const DEFAULT_FEATURED: FeaturedItem[] = [
  {
    id: '166610',
    type: 'ANIME',
    title: 'SOLO LEVELING',
    subtitle: 'Arise from the Shadows',
    kicker: '🔥 Nova temporada no ar — hora de se atualizar!',
    seasonsCount: 2,
    episodesCount: 25,
    score: 8.7,
    genres: 'Ação, Fantasia, Sobrenatural',
    overview:
      'Em um mundo onde caçadores despertam poderes para combater monstros mortais, Sung Jinwoo, o caçador mais fraco de toda a humanidade, se encontra à beira da morte e desperta um sistema misterioso de evolução contínua.',
    bannerUrl: 'https://image.tmdb.org/t/p/original/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg',
  },
  {
    id: '1429',
    type: 'ANIME',
    title: 'ATTACK ON TITAN',
    subtitle: 'Shingeki no Kyojin',
    kicker: '⚡ Recapitule as reviravoltas antes do desfecho final',
    seasonsCount: 4,
    episodesCount: 89,
    score: 9.1,
    genres: 'Ação, Mistério, Drama',
    overview:
      'Após anos lutando pela sobrevivência atrás de muralhas colossais, Eren Jaeger e seus companheiros descobrem a verdade sobre o mundo exterior e os segredos milenares dos Titãs.',
    bannerUrl: 'https://image.tmdb.org/t/p/original/hPkWb89eTGB90N2a2m8j1hK5bF7.jpg',
  },
  {
    id: '94605',
    type: 'ANIME',
    title: 'ARCANE',
    subtitle: 'League of Legends',
    kicker: '✨ Temporada 2 disponível — relembre a guerra de Zaun e Piltover',
    seasonsCount: 2,
    episodesCount: 18,
    score: 9.0,
    genres: 'Ação, Sci-Fi, Fantasia',
    overview:
      'A rivalidade entre as cidades de Piltover e Zaun explode em guerra total com a invenção da tecnologia Hextech e a droga Shimmer, colocando duas irmãs em caminhos opostos e trágicos.',
    bannerUrl: 'https://image.tmdb.org/t/p/original/v5D0k11Q9Q5d5Lh1W5Yy7nJ5qR.jpg',
  },
  {
    id: '1399',
    type: 'SERIES',
    title: 'GAME OF THRONES',
    subtitle: 'As Crônicas de Gelo e Fogo',
    kicker: '👑 Relembre as batalhas pelo Trono de Ferro sem spoilers',
    seasonsCount: 8,
    episodesCount: 73,
    score: 8.4,
    genres: 'Fantasia, Drama, Aventura',
    overview:
      'Sete reinos nobres travam uma guerra mortal pelo Trono de Ferro de Westeros, enquanto uma antiga ameaça sobrenatural desperta no Norte além da Muralha.',
    bannerUrl: 'https://image.tmdb.org/t/p/original/2OMB0ynKlyIenMJWI2Dy9IWT4c.jpg',
  },
];

export const FeaturedHeroBanner: React.FC<FeaturedHeroBannerProps> = ({ items }) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [bookmarked, setBookmarked] = useState<Record<string, boolean>>({});

  const displayList: FeaturedItem[] =
    items && items.length > 0
      ? items.slice(0, 5).map((item, idx) => {
          const hasSeasons = Boolean(item.totalSeasons && item.totalSeasons > 0);
          const kicker =
            item.status === 'RELEASING'
              ? '🔥 Nova temporada em exibição — fique em dia!'
              : hasSeasons && item.totalSeasons! > 1
              ? `⚡ ${item.totalSeasons} Temporadas disponíveis para recapitular`
              : '✨ Recapitulação inteligente sem spoilers';

          return {
            id: item.externalId || item.id || `featured-${idx}`,
            type: item.type || 'ANIME',
            title: item.title || 'Sem título',
            subtitle:
              item.originalTitle && item.originalTitle !== item.title
                ? item.originalTitle
                : 'Recapitulação sem Spoilers',
            kicker,
            seasonsCount: item.totalSeasons,
            episodesCount: item.totalEpisodes,
            score: item.score,
            genres:
              item.genres && item.genres.length > 0
                ? item.genres.slice(0, 3).join(', ')
                : item.type === 'ANIME'
                ? 'Anime, Ação'
                : 'Série, Drama',
            overview:
              item.overview ||
              'Consulte resumos estruturados por temporada e episódio, e converse com a IA com proteção anti-spoiler.',
            bannerUrl:
              item.backdropUrl ||
              item.posterUrl ||
              DEFAULT_FEATURED[idx % DEFAULT_FEATURED.length].bannerUrl,
          };
        })
      : DEFAULT_FEATURED;

  const current = displayList[currentIndex] || displayList[0];

  // Auto-play suave a cada 7s quando não houver hover
  useEffect(() => {
    if (isHovered || displayList.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayList.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [isHovered, displayList.length]);

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
    <section
      className="max-w-7xl mx-auto px-4  relative z-10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Banner Destaque */}
      <div className="relative w-full h-[520px] md:h-[560px] rounded-3xl overflow-hidden group border border-brand-border bg-brand-card shadow-2xl">
        {/* Background Image */}
        <img
          key={current.bannerUrl}
          src={current.bannerUrl}
          alt={current.title}
          className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition-all duration-700 ease-out"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://image.tmdb.org/t/p/original/2OMB0ynKlyIenMJWI2Dy9IWT4c.jpg';
          }}
        />

        {/* Gradients para escurecer lado esquerdo e base */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/90 md:via-brand-dark/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/40 to-transparent" />

        {/* Conteúdo do Banner */}
        <div className="absolute inset-y-0 left-0 flex flex-col justify-center p-6 sm:p-10 md:p-16 w-full md:w-3/4 lg:w-2/3 z-10">
          {/* Kicker e Badge Anti-Spoiler */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-purple/20 text-pink-300 border border-brand-purple/40 backdrop-blur-md shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-brand-pink shrink-0" />
              <span>{current.kicker}</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span>Trava Anti-Spoiler</span>
            </span>
          </div>

          {/* Título e Subtítulo */}
          <div className="mb-3">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black italic tracking-tighter text-white drop-shadow-lg uppercase line-clamp-2">
              {current.title}
            </h2>
            <h3 className="text-base sm:text-xl md:text-2xl font-bold text-brand-purple mt-1 drop-shadow-md line-clamp-1">
              {current.subtitle}
            </h3>
          </div>

          {/* Meta Info (Alinhada ao RecapMe) */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs sm:text-sm text-gray-300 mb-5 font-medium">
            <Badge
              variant={current.type === 'ANIME' ? 'anime' : 'series'}
              className="py-0.5 px-2.5 uppercase tracking-wider text-[11px]"
            >
              {current.type === 'ANIME' ? 'Anime' : 'Série'}
            </Badge>

            {current.seasonsCount ? (
              <>
                <span className="text-gray-500">•</span>
                <span className="flex items-center gap-1 text-gray-200">
                  <Layers className="h-3.5 w-3.5 text-brand-purple" />
                  {current.seasonsCount} {current.seasonsCount === 1 ? 'Temporada' : 'Temporadas'}
                </span>
              </>
            ) : null}

            {current.episodesCount ? (
              <>
                <span className="text-gray-500">•</span>
                <span className="text-gray-300">{current.episodesCount} episódios</span>
              </>
            ) : null}

            {current.score != null && current.score > 0 ? (
              <>
                <span className="text-gray-500">•</span>
                <span className="flex items-center gap-1 text-amber-300 font-semibold">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  {current.score.toFixed(1)}
                </span>
              </>
            ) : null}

            {current.genres ? (
              <>
                <span className="text-gray-500 hidden sm:inline">•</span>
                <span className="text-gray-400 hidden sm:inline text-xs">{current.genres}</span>
              </>
            ) : null}
          </div>

          {/* Sinopse */}
          <p className="text-gray-300 text-xs sm:text-sm md:text-base max-w-xl mb-6 sm:mb-8 line-clamp-3 md:line-clamp-4 leading-relaxed font-light">
            {current.overview}
          </p>

          {/* Botões de Ação */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <Button
              variant="gradient"
              size="lg"
              onClick={() => navigate(`/media/${current.type}/${current.id}`)}
              className="h-auto py-3 px-6 rounded-xl flex items-center gap-2.5 transition-all shadow-lg shadow-brand-purple/25 hover:shadow-brand-purple/40 hover:scale-105 font-bold tracking-wide cursor-pointer"
            >
              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Relembrar Agora</span>
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() =>
                navigate(`/media/${current.type}/${current.id}`, { state: { openChat: true } })
              }
              className="h-auto py-3 px-5 rounded-xl flex items-center gap-2 bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-md transition-all hover:scale-105 font-medium cursor-pointer"
            >
              <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-brand-pink" />
              <span>Perguntar à IA</span>
            </Button>

            <button
              onClick={(e) => toggleBookmark(current.id, e)}
              className="border border-white/20 hover:border-white/50 text-white p-3 rounded-xl transition-all bg-white/5 hover:bg-white/15 backdrop-blur-md cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple hover:scale-105"
              title={bookmarked[current.id] ? 'Remover dos salvos' : 'Salvar na minha lista'}
              aria-label="Salvar na minha lista"
            >
              <Bookmark
                className={`h-5 w-5 transition-colors ${
                  bookmarked[current.id] ? 'fill-brand-purple text-brand-purple' : 'text-gray-300'
                }`}
              />
            </button>
          </div>

          {/* Indicadores (Dots) */}
          <div className="flex items-center gap-2 mt-6 md:mt-8">
            {displayList.map((item, idx) => (
              <button
                key={`dot-${item.id}-${idx}`}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Slide ${idx + 1}`}
                className={`h-1.5 transition-all duration-300 rounded-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple ${
                  idx === currentIndex
                    ? 'w-8 bg-gradient-to-r from-brand-purple to-brand-pink shadow-[0_0_10px_rgba(168,85,247,0.7)]'
                    : 'w-3.5 bg-white/20 hover:bg-white/40'
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
            className="bg-black/50 hover:bg-black p-3 rounded-full backdrop-blur border border-white/10 text-white transition-all hover:scale-110 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
        <div className="absolute inset-y-0 left-4 hidden md:flex items-center z-20">
          <button
            onClick={handlePrev}
            aria-label="Anterior"
            className="bg-black/50 hover:bg-black p-3 rounded-full backdrop-blur border border-white/10 text-white transition-all hover:scale-110 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        </div>
      </div>
    </section>
  );
};
