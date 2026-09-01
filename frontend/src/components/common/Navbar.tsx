import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, Search, Flame, Star, TrendingUp, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const navLinks = [
  { name: "Busca", href: "#search-section", icon: Search },
  { name: "Em alta", href: "#trending", icon: TrendingUp },
  { name: "Popular", href: "#popular", icon: Flame },
  { name: "Most Rated", href: "#most-rated", icon: Star },
];

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setIsMobileMenuOpen(false);
    if (href.startsWith('#')) {
      if (location.pathname !== '/') {
        navigate(`/${href}`);
        return;
      }

      if (href === '#search-section' || href === '#search') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => {
          const input = document.querySelector('#search-section input') as HTMLInputElement;
          if (input) {
            input.focus();
          }
        }, 400);
        return;
      }

      const el = document.querySelector(href);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header
      className={cn(
        "fixed z-50 transition-all duration-500",
        isScrolled
          ? "top-4 left-4 right-4"
          : "top-0 left-0 right-0"
      )}
    >
      <nav
        className={cn(
          "mx-auto transition-all duration-500",
          isScrolled || isMobileMenuOpen
            ? "bg-background/85 backdrop-blur-xl border-white/10 rounded-2xl shadow-2xl shadow-black/50 max-w-[1200px]"
            : "bg-transparent max-w-[1400px]"
        )}
      >
        <div
          className={cn(
            "relative flex items-center justify-between transition-all duration-500 px-6 lg:px-8",
            isScrolled ? "h-14" : "h-20"
          )}
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className={cn(
              "rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-violet-400 flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:scale-105 transition-all duration-300",
              isScrolled ? "h-8 w-8" : "h-9 w-9"
            )}>
              <Sparkles className={cn("text-white animate-pulse", isScrolled ? "h-4 w-4" : "h-4.5 w-4.5")} />
            </div>
            <div className="flex items-baseline gap-1">
              <span className={cn(
                "font-extrabold tracking-tight transition-all duration-500 text-white",
                isScrolled ? "text-lg" : "text-xl"
              )}>
                Recap<span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Me</span>
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8 lg:gap-10 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  if (location.pathname === '/') {
                    e.preventDefault();
                    handleNavClick(link.href);
                  }
                }}
                className={cn(
                  "text-sm font-medium transition-colors duration-300 relative group flex items-center gap-1.5",
                  isScrolled ? "text-foreground/80 hover:text-white" : "text-white/80 hover:text-white"
                )}
              >
                <span>{link.name}</span>
                <span
                  className={cn(
                    "absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 transition-all duration-300 group-hover:w-full",
                    isScrolled ? "opacity-100" : "opacity-80"
                  )}
                />
              </a>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-white hover:text-purple-400 transition-colors"
            aria-label="Menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-x-4 top-20 bg-background/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in-0 zoom-in-95 duration-200">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  if (location.pathname === '/') {
                    e.preventDefault();
                    handleNavClick(link.href);
                  } else {
                    setIsMobileMenuOpen(false);
                  }
                }}
                className="flex items-center gap-3 p-3 rounded-xl text-base font-medium text-foreground/90 hover:bg-white/5 hover:text-white transition-colors"
              >
                <link.icon className="h-5 w-5 text-purple-400" />
                {link.name}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

