import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, Film, Tv, Sparkles, X } from 'lucide-react';
import { mediaService } from '@/services/mediaService';
import { MediaItem, MediaType } from '@/types/media';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  initialQuery?: string;
  onSelectMedia?: (media: MediaItem) => void;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  initialQuery = '',
  onSelectMedia,
  className,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [selectedType, setSelectedType] = useState<MediaType | undefined>(undefined);
  const [results, setResults] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await mediaService.search(query, selectedType);
        setResults(data.items || []);
        setIsOpen(true);
      } catch (err) {
        console.error('Erro na busca:', err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, selectedType]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item: MediaItem) => {
    setIsOpen(false);
    if (onSelectMedia) {
      onSelectMedia(item);
    } else {
      navigate(`/media/${item.type}/${item.externalId}`);
    }
  };

  const clearQuery = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div className={cn("relative w-full max-w-2xl mx-auto", className)} ref={dropdownRef}>
      {/* Pills de Categoria */}
      <div className="flex items-center justify-center gap-2 mb-3">
        <button
          type="button"
          onClick={() => setSelectedType(undefined)}
          className={cn(
            "px-3.5 py-1 text-xs font-semibold rounded-full transition-all duration-200",
            selectedType === undefined
              ? "bg-purple-600 text-white shadow-md shadow-purple-500/20 scale-105"
              : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          ✨ Todos
        </button>
        <button
          type="button"
          onClick={() => setSelectedType('SERIES')}
          className={cn(
            "px-3.5 py-1 text-xs font-semibold rounded-full transition-all duration-200 flex items-center gap-1",
            selectedType === 'SERIES'
              ? "bg-purple-600 text-white shadow-md shadow-purple-500/20 scale-105"
              : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Tv className="h-3 w-3" /> Séries
        </button>
        <button
          type="button"
          onClick={() => setSelectedType('ANIME')}
          className={cn(
            "px-3.5 py-1 text-xs font-semibold rounded-full transition-all duration-200 flex items-center gap-1",
            selectedType === 'ANIME'
              ? "bg-purple-600 text-white shadow-md shadow-purple-500/20 scale-105"
              : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Sparkles className="h-3 w-3" /> Animes
        </button>
        <button
          type="button"
          onClick={() => setSelectedType('MOVIE')}
          className={cn(
            "px-3.5 py-1 text-xs font-semibold rounded-full transition-all duration-200 flex items-center gap-1",
            selectedType === 'MOVIE'
              ? "bg-purple-600 text-white shadow-md shadow-purple-500/20 scale-105"
              : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Film className="h-3 w-3" /> Filmes
        </button>
      </div>

      {/* Input de Busca */}
      <div className="relative group">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 opacity-20 blur-lg group-hover:opacity-40 transition-opacity" />
        <div className="relative flex items-center bg-card/90 border border-border/80 rounded-2xl shadow-xl overflow-hidden focus-within:border-purple-500/80 focus-within:ring-2 focus-within:ring-purple-500/30 transition-all">
          <div className="pl-4 pr-2 text-muted-foreground">
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-purple-400" />
            ) : (
              <Search className="h-5 w-5 text-purple-400" />
            )}
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setIsOpen(true)}
            placeholder="Digite o nome de uma série, anime ou filme (ex: Game of Thrones, Naruto)..."
            className="w-full bg-transparent py-3.5 pr-10 text-sm md:text-base text-foreground placeholder:text-muted-foreground/70 outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={clearQuery}
              className="pr-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Dropdown de Resultados */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-xl glass-card shadow-2xl overflow-hidden border border-border/80 divide-y divide-border/40 max-h-96 overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-150">
          {results.length === 0 && !isLoading ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Nenhuma obra encontrada para &quot;{query}&quot;. Tente outro termo ou ajuste os filtros.
            </div>
          ) : (
            results.map((item) => (
              <button
                key={`${item.type}-${item.externalId}`}
                type="button"
                onClick={() => handleSelect(item)}
                className="w-full p-3.5 flex items-center gap-3.5 hover:bg-white/5 transition-colors text-left group"
              >
                {item.posterUrl ? (
                  <img
                    src={item.posterUrl}
                    alt={item.title}
                    className="h-14 w-10 object-cover rounded-md shadow-md flex-shrink-0 group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="h-14 w-10 bg-muted/60 rounded-md flex items-center justify-center flex-shrink-0 text-muted-foreground">
                    <Film className="h-5 w-5" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-foreground truncate group-hover:text-purple-400 transition-colors">
                      {item.title}
                    </h4>
                    {item.releaseYear && (
                      <span className="text-xs text-muted-foreground">({item.releaseYear})</span>
                    )}
                  </div>
                  {item.originalTitle && item.originalTitle !== item.title && (
                    <p className="text-xs text-muted-foreground truncate">{item.originalTitle}</p>
                  )}
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                    {item.overview || 'Sinopse disponível na página de detalhes.'}
                  </p>
                </div>
                <Badge variant={item.type === 'ANIME' ? 'warning' : 'default'} className="text-[10px] uppercase font-bold flex-shrink-0">
                  {item.type}
                </Badge>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};
