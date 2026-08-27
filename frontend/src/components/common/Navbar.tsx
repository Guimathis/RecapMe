import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Film, Tv, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const Navbar: React.FC = () => {
  return (
    <header className="sticky top-0 z-40 w-full glass border-b border-border/40">
      <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-violet-400 flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:scale-105 transition-transform duration-300">
            <Sparkles className="h-5 w-5 text-white animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-purple-300 bg-clip-text text-transparent">
              Recap<span className="text-purple-400">Me</span>
            </span>
            <span className="text-[10px] text-muted-foreground font-medium -mt-1 tracking-wider uppercase">
              Spoiler-Free AI Recaps
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors flex items-center gap-1.5">
            <Tv className="h-4 w-4 text-purple-400" />
            Séries & Animes
          </Link>
          <Link to="/" className="hover:text-foreground transition-colors flex items-center gap-1.5">
            <Film className="h-4 w-4 text-indigo-400" />
            Filmes & Sequências
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Badge variant="success" className="gap-1.5 py-1 px-3 hidden sm:inline-flex">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Anti-Spoiler Ativo</span>
          </Badge>
        </div>
      </div>
    </header>
  );
};
