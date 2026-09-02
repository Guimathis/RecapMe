import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, Film, X } from 'lucide-react';
import { mediaService } from '@/services/mediaService';
import { MediaItem } from '@/types/media';
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
        const data = await mediaService.search(query);
        setResults(data.items || []);
        setIsOpen(true);
      } catch (err) {
        console.error('Erro na busca:', err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

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
    <div className={cn("relative w-full max-w-3xl mx-auto scroll-mt-28 group", className)} ref={dropdownRef} id="search-section">
      {/* Background glow on hover/focus */}
      <div className="absolute inset-0 bg-gradient-to-r from-brand-purple/25 via-pink-500/20 to-brand-purple/25 blur-xl rounded-full opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Input de Busca */}
      <div className="relative flex items-center bg-brand-inset border border-brand-border group-focus-within:border-brand-purple/70 rounded-full px-6 py-4 shadow-2xl transition-all duration-300">
        <div className="mr-3 text-brand-purple flex items-center justify-center">
          {isLoading ? (
            <Loader2 className="h-5 w-5 md:h-6 md:w-6 animate-spin text-brand-purple" />
          ) : (
            <Search className="h-5 w-5 md:h-6 md:w-6 text-brand-purple" />
          )}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder="Digite o nome de uma série, anime ou filme (ex: Game of Thrones, Naruto)..."
          className="bg-transparent border-none outline-none w-full text-white placeholder-gray-500 text-sm md:text-base font-normal"
        />
        {query && (
          <button
            type="button"
            onClick={clearQuery}
            className="ml-2 text-gray-500 hover:text-white transition-colors p-1 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Limpar busca"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Dropdown de Resultados */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-3 z-50 rounded-2xl bg-brand-card/95 backdrop-blur-2xl shadow-2xl shadow-black/90 overflow-hidden border border-brand-border divide-y divide-brand-border/40 max-h-96 overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-150 hide-scrollbar">
          {results.length === 0 && !isLoading ? (
            <div className="p-6 text-center text-sm text-gray-400">
              Nenhuma obra encontrada para &quot;{query}&quot;. Tente o nome original em japonês/inglês ou em português.
            </div>
          ) : (
            results.map((item) => (
              <button
                key={`${item.type}-${item.externalId}`}
                type="button"
                onClick={() => handleSelect(item)}
                className="w-full p-4 flex items-center gap-4 hover:bg-white/5 transition-colors text-left group/item focus-visible:outline-none focus-visible:bg-white/10"
              >
                {item.posterUrl ? (
                  <img
                    src={item.posterUrl}
                    alt={item.title}
                    className="h-16 w-11 object-cover rounded-lg shadow-md flex-shrink-0 group-hover/item:scale-105 transition-transform"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="h-16 w-11 bg-brand-card border border-brand-border rounded-lg flex items-center justify-center flex-shrink-0 text-gray-500">
                    <Film className="h-5 w-5" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-white truncate group-hover/item:text-brand-purple transition-colors text-sm sm:text-base">
                      {item.title}
                    </h4>
                    {item.releaseYear && (
                      <span className="text-xs text-gray-400">({item.releaseYear})</span>
                    )}
                  </div>
                  {item.originalTitle && item.originalTitle !== item.title && (
                    <p className="text-xs text-gray-400 truncate">{item.originalTitle}</p>
                  )}
                  <p className="text-xs text-gray-400 line-clamp-1 mt-1">
                    {item.overview || 'Sinopse disponível na página de detalhes.'}
                  </p>
                </div>
                <Badge
                  variant={item.type === 'ANIME' ? 'anime' : 'series'}
                  className="flex-shrink-0"
                >
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
