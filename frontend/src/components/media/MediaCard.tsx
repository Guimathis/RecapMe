import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Film, Bookmark } from 'lucide-react';
import { MediaItem } from '@/types/media';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface MediaCardProps {
  media: MediaItem;
  className?: string;
}

export const MediaCard: React.FC<MediaCardProps> = ({ media, className }) => {
  const [bookmarked, setBookmarked] = useState(false);

  const toggleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setBookmarked(!bookmarked);
  };

  return (
    <Link
      to={`/media/${media.type}/${media.externalId}`}
      className={cn(
        "group flex flex-col aspect-[2/3] rounded-2xl overflow-hidden bg-brand-card border border-brand-border hover:border-brand-purple transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-brand-purple/20 relative cursor-pointer",
        className
      )}
    >
      {/* Poster Image Container */}
      <div className="relative w-full h-full overflow-hidden bg-[#0d0d14]">
        {media.posterUrl ? (
          <img
            src={media.posterUrl}
            alt={media.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 gap-2 p-4 text-center">
            <Film className="h-10 w-10 text-gray-600" />
            <span className="text-xs">Sem pôster</span>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
          <Badge
            variant={media.type === 'ANIME' ? 'warning' : 'default'}
            className={cn(
              "backdrop-blur-md font-bold text-[10px] uppercase tracking-wider py-0.5 px-2",
              media.type === 'ANIME'
                ? "bg-brand-purple/20 text-brand-purple border-brand-purple/40"
                : "bg-[#ff5500]/20 text-[#ff5500] border-[#ff5500]/40"
            )}
          >
            {media.type === 'ANIME' ? 'Anime' : media.type === 'MOVIE' ? 'Filme' : 'Série'}
          </Badge>

          {/* Bookmark Button (visible on hover or when bookmarked) */}
          <button
            onClick={toggleBookmark}
            aria-label="Salvar obra"
            className={cn(
              "bg-brand-dark/80 backdrop-blur-md p-1.5 rounded-lg text-gray-300 hover:text-white transition-opacity duration-200 border border-brand-border/60",
              bookmarked ? "opacity-100 text-brand-purple" : "opacity-0 group-hover:opacity-100"
            )}
          >
            <Bookmark className={cn("h-3.5 w-3.5", bookmarked && "fill-brand-purple")} />
          </button>
        </div>

        {/* Bottom Content Info */}
        <div className="absolute bottom-0 inset-x-0 p-4 z-10 flex flex-col justify-end">
          {media.releaseYear && (
            <span className="text-[11px] text-gray-400 font-medium mb-1">{media.releaseYear}</span>
          )}
          <p className="font-bold text-sm sm:text-base text-white truncate group-hover:text-brand-purple transition-colors">
            {media.title}
          </p>
          {media.originalTitle && media.originalTitle !== media.title && (
            <p className="text-xs text-gray-400 truncate mt-0.5">{media.originalTitle}</p>
          )}
        </div>
      </div>
    </Link>
  );
};
