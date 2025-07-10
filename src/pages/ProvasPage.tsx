import React, { useEffect } from 'react';
import InstituicoesList from '@/components/instituicoes/InstituicoesList';

const ProvasPage = () => {
  useEffect(() => {
    console.log('ProvasPage foi montada!'); // Adicionado para depuração
  }, []);

  return (
    <div className="flex flex-col h-full bg-background p-6">
      <h1 className="text-3xl font-bold text-foreground mb-6">Provas e Instituições</h1>
      <div className="flex-1 overflow-auto">
        <InstituicoesList />
      </div>
    </div>
  );
};

export default ProvasPage;
