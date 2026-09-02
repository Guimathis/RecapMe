import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-brand-border/60 py-12 bg-[#050505] text-gray-400 mt-auto relative z-10">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Logo & Tagline */}
        <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
          <Link to="/" className="flex items-center group">
            <span className="font-black text-xl tracking-tight text-white hover:text-white transition-colors">
              recap<span className="text-brand-purple">.me</span>
            </span>
          </Link>
          <span className="hidden sm:inline text-gray-600">•</span>
          <p className="text-xs text-gray-500">
            Resumos estruturados e conversas inteligentes sem spoilers.
          </p>
        </div>

        {/* Links & Copyright */}
        <div className="flex flex-col sm:flex-row items-center gap-6 text-xs text-gray-500">
          <div className="flex items-center gap-4 text-gray-400">
            <a href="#search-section" className="hover:text-white transition-colors">Busca</a>
            <a href="#trending" className="hover:text-white transition-colors">Trending Now</a>
            <a href="#popular" className="hover:text-white transition-colors">Popular</a>
            <a href="#most-rated" className="hover:text-white transition-colors">Most Rated</a>
          </div>
          <p>© 2026 RecapMe.</p>
        </div>
      </div>
    </footer>
  );
};
