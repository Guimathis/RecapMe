import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="container max-w-md mx-auto px-4 py-32 text-center space-y-6">
      <div className="h-16 w-16 rounded-2xl bg-purple-600/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mx-auto">
        <Sparkles className="h-8 w-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-foreground">404</h1>
      <p className="text-sm text-muted-foreground">
        A página que você está procurando não existe ou foi movida.
      </p>
      <Link to="/">
        <Button variant="gradient" className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Voltar para o Início
        </Button>
      </Link>
    </div>
  );
};
