import React, { useEffect } from 'react';
import InstituicoesList from '@/components/instituicoes/InstituicoesList';

const ProvasPage = () => {
  useEffect(() => {
    console.log('ProvasPage foi montada!'); // Adicionado para depuração
  }, []);

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex-1 overflow-auto">
        <InstituicoesList />
      </div>
    </div>
  );
};

export default ProvasPage;
