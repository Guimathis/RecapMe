import React, { useEffect, useState } from 'react';
import { SearchBar } from '@/components/common/SearchBar';
import { TrendingPeekCarousel } from '@/components/media/TrendingPeekCarousel';
import { MediaItem } from '@/types/media';

interface HeroSectionProps {
  trendingItems?: MediaItem[];
  isLoadingTrending?: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  trendingItems,
  isLoadingTrending = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative min-h-[92vh] lg:min-h-screen flex flex-col justify-between overflow-hidden bg-black text-white pt-24 pb-8 lg:pb-12">
      {/* Background Video */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <video
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
          className="w-full h-full object-cover object-center opacity-75"
        >
          <source
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/bg-hero-0BnFGdr81Ifnj3WbBZoNt1KE4D5DMT.mp4"
            type="video/mp4"
          />
        </video>
        {/* Subtle overlays for text contrast and bottom blending */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black" />
      </div>

      {/* Subtle tech grid lines */}
      <div className="absolute inset-0 z-[1] overflow-hidden pointer-events-none opacity-15">
        {[...Array(6)].map((_, i) => (
          <div
            key={`h-${i}`}
            className="absolute h-px bg-white/10"
            style={{
              top: `${16.6 * (i + 1)}%`,
              left: 0,
              right: 0,
            }}
          />
        ))}
        {[...Array(10)].map((_, i) => (
          <div
            key={`v-${i}`}
            className="absolute w-px bg-white/10"
            style={{
              left: `${10 * (i + 1)}%`,
              top: 0,
              bottom: 0,
            }}
          />
        ))}
      </div>

      {/* Center Main Content (Copy + Search) */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-12 my-auto pt-6 pb-8">
        <div className="max-w-3xl">
          {/* Eyebrow */}
          <div
            className={`mb-5 transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <span className="inline-flex items-center gap-3 text-xs md:text-sm font-mono text-white/70 tracking-wide">
              <span className="w-8 h-px bg-purple-400/60" />
              Spoiler-Free AI Recaps & Smart Synopsis
            </span>
          </div>

          {/* Main Headline */}
          <div className="mb-4">
            <h1
              className={`text-left text-3xl sm:text-5xl md:text-6xl font-extrabold font-display leading-[1.08] tracking-tight text-white transition-all duration-500 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              <span className="block">Lançou nova temporada e</span>
              <span className="block bg-gradient-to-r from-purple-400 via-pink-300 to-indigo-300 bg-clip-text text-transparent pt-2">
                você não lembra de nada?
              </span>
            </h1>
          </div>

          {/* Subtitle */}
          <p
            className={`text-sm sm:text-base md:text-lg text-white/70 max-w-2xl leading-relaxed mb-8 transition-all duration-500 delay-200 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            Consulte resumos estruturados por temporada e episódio, e converse com a IA com uma trava inteligente que impede spoilers do futuro da trama.
          </p>

          {/* Search Bar */}
          <div
            className={`w-full max-w-2xl transition-all duration-500 delay-300 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            <SearchBar />
          </div>
        </div>
      </div>

      {/* Base Sneak Peek: Trending Now Carousel */}
      <div
        className={`relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-12 transition-all duration-1000 delay-500 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <TrendingPeekCarousel items={trendingItems} isLoading={isLoadingTrending} />
      </div>
    </section>
  );
};
