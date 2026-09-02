import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="container max-w-md mx-auto px-4 py-40 text-center space-y-6">
      <h1 className="text-7xl font-black tracking-tight text-white">404</h1>
      <p className="text-sm text-gray-400 font-light leading-relaxed">
        A página que você está procurando não existe ou foi movida para outro endereço.
      </p>
      <div>
        <Link to="/">
          <Button className="gap-2 bg-brand-purple hover:bg-brand-purple/80 text-white rounded-full px-6 py-2.5 font-medium cursor-pointer shadow-lg shadow-brand-purple/25">
            <ArrowLeft className="h-4 w-4" /> Voltar para o Início
          </Button>
        </Link>
      </div>
    </div>
  );
};
