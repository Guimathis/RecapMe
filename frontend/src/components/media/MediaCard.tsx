import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Sparkles, Film } from 'lucide-react';
import { MediaItem } from '@/types/media';
import { Badge } from '@/components/ui/badge';

interface MediaCardProps {
  media: MediaItem;
}

export const MediaCard: React.FC<MediaCardProps> = ({ media }) => {
  return (
    <Link
      to={`/media/${media.type}/${media.externalId}`}
      className="group flex flex-col rounded-2xl overflow-hidden glass-card hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-1.5 shadow-lg hover:shadow-purple-500/15"
    >
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-muted/40">
        {media.posterUrl ? (
          <img
            src={media.posterUrl}
            alt={media.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-2 p-4 text-center">
            <Film className="h-10 w-10 text-muted-foreground/50" />
            <span className="text-xs">Sem pôster disponível</span>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

        {/* Type Badge */}
        <div className="absolute top-3 left-3">
          <Badge
            variant={media.type === 'ANIME' ? 'warning' : 'default'}
            className="backdrop-blur-md shadow font-bold text-[10px] uppercase tracking-wider"
          >
            {media.type === 'ANIME' ? 'Anime' : media.type === 'MOVIE' ? 'Filme' : 'Série'}
          </Badge>
        </div>

        {/* Hover Play / Recap CTA */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-xs">
          <div className="h-12 w-12 rounded-full bg-purple-600/90 text-white flex items-center justify-center shadow-xl shadow-purple-500/40 transform scale-75 group-hover:scale-100 transition-transform">
            <Play className="h-5 w-5 fill-white ml-0.5" />
          </div>
        </div>
      </div>

      {/* Info Content */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>{media.releaseYear || 'Ano N/D'}</span>
            <span className="flex items-center gap-1 text-purple-400 font-medium">
              <Sparkles className="h-3 w-3" /> Recap com IA
            </span>
          </div>
          <h3 className="font-bold text-foreground group-hover:text-purple-400 transition-colors line-clamp-1">
            {media.title}
          </h3>
          {media.originalTitle && media.originalTitle !== media.title && (
            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{media.originalTitle}</p>
          )}
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2 mt-2 leading-relaxed">
          {media.overview || 'Clique para ver o resumo completo das temporadas e episódios sem spoilers.'}
        </p>
      </div>
    </Link>
  );
};
