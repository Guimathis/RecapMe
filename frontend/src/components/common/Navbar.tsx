import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const homeNavLinks = [
  { name: "Busca", href: "#search-section" },
  { name: "Em Alta", href: "#trending" },
  { name: "Populares", href: "#popular" },
  { name: "Mais Bem Avaliados", href: "#most-rated" },
];

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isHomePage = location.pathname === '/';

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setIsMobileMenuOpen(false);

    if (location.pathname !== '/') {
      navigate(href.startsWith('/') ? href : `/${href}`);
      return;
    }

    const target = href.replace(/^\//, '');

    if (target === '#search-section' || target === '#search') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        const input = document.querySelector('#search-section input') as HTMLInputElement;
        if (input) {
          input.focus();
        }
      }, 400);
      return;
    }

    if (target.startsWith('#')) {
      const el = document.querySelector(target);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div
      className={cn(
        "fixed top-0 left-0 w-full z-50 flex justify-center transition-all duration-300 pointer-events-none",
        isScrolled ? "pt-4" : "pt-2"
      )}
      id="nav-wrapper"
    >
      <nav
        id="navbar"
        className={cn(
          "pointer-events-auto flex justify-between items-center",
          isScrolled
            ? "w-[92%] max-w-4xl bg-brand-card/85 backdrop-blur-lg rounded-full px-6 md:px-8 py-3 shadow-2xl border border-brand-border transition-all duration-300"
            : "w-full max-w-7xl bg-transparent px-6 py-4 md:py-6 border border-transparent transition-[width,max-width,padding,background-color,border-radius,box-shadow,backdrop-filter] duration-300"
        )}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg">
          <span className="text-xl md:text-2xl font-black tracking-tight text-white hover:text-white transition-colors">
            recap<span className="text-brand-purple">.me</span>
          </span>
        </Link>

        {isHomePage ? (
          <>
            {/* Links da Home (Escondidos no mobile) */}
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
              {homeNavLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(link.href);
                  }}
                  className="hover:text-white transition-colors cursor-pointer relative group/link py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                >
                  <span>{link.name}</span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-purple transition-all duration-300 group-hover/link:w-full" />
                </a>
              ))}
            </div>

            {/* Mobile Menu Icon */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-400 hover:text-white p-1 transition-colors rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </>
        ) : (
          /* Na página de uma obra, exibe apenas a opção de Busca */
          <div className="flex items-center gap-8 text-sm font-medium text-gray-400">
            <a
              href="/#search-section"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('/#search-section');
              }}
              className="hover:text-white transition-colors cursor-pointer relative group/link py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            >
              <span>Busca</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-purple transition-all duration-300 group-hover/link:w-full" />
            </a>
          </div>
        )}
      </nav>

      {/* Mobile Menu Overlay (apenas na Home) */}
      {isHomePage && isMobileMenuOpen && (
        <div className="pointer-events-auto md:hidden fixed inset-x-4 top-20 bg-brand-card/95 backdrop-blur-2xl border border-brand-border rounded-3xl p-6 shadow-2xl space-y-3 animate-in fade-in-0 zoom-in-95 duration-200">
          <div className="flex flex-col gap-2">
            {homeNavLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.href);
                }}
                className="flex items-center justify-between p-3 rounded-xl text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span>{link.name}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

