import React from 'react';
import { Sparkles, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border/40 py-8 bg-background/80 text-muted-foreground mt-auto">
      <div className="container max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-400" />
          <span>
            <strong className="text-foreground">RecapMe</strong> — Resumos inteligentes e contextualizados com Spring AI & TMDb/Jikan.
          </span>
        </div>
        <p className="flex items-center gap-1">
          Feito com <Heart className="h-3 w-3 text-red-500 fill-red-500 inline" /> para cinéfilos e otakus.
        </p>
      </div>
    </footer>
  );
};
