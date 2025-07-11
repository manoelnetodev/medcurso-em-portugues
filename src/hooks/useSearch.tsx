import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export function useSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      toast({
        title: "Busca vazia",
        description: "Digite algo para buscar",
        variant: "default"
      });
      return;
    }

    setIsSearching(true);
    setSearchQuery(query);

    try {
      // Simular busca - aqui você pode implementar a lógica real de busca
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Por enquanto, redirecionar para a página de questões com o termo de busca
      navigate(`/questoes?search=${encodeURIComponent(query)}`);
      
      toast({
        title: "Busca realizada",
        description: `Buscando por: "${query}"`,
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Erro na busca",
        description: "Ocorreu um erro ao realizar a busca",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  }, [navigate, toast]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    isSearching,
    handleSearch,
    clearSearch
  };
} 