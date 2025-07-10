import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Play, Trash2 } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom'; // Importar useNavigate

const ITEMS_PER_PAGE = 7;

const ListasPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate(); // Inicializar useNavigate

  const [listas, setListas] = useState<Tables<'lista'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const fetchListas = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const from = currentPage * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    let query = supabase
      .from('lista')
      .select('*', { count: 'exact' })
      .eq('user', user.id)
      .order('criado_em', { ascending: false });

    if (searchTerm) {
      query = query.ilike('nome', `%${searchTerm}%`);
    }

    const { data, error, count } = await query.range(from, to);

    if (error) {
      console.error('Erro ao buscar listas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar suas listas.",
        variant: "destructive",
      });
    } else {
      setListas(data || []);
      setTotalCount(count || 0);
    }
    setLoading(false);
  }, [currentPage, searchTerm, user, toast]);

  useEffect(() => {
    fetchListas();
  }, [fetchListas]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const getStatusBadge = (lista: Tables<'lista'>) => {
    if (lista.finalizada) {
      return <Badge variant="default" className="bg-green-500 text-white">Finalizada</Badge>;
    }
    if (lista.total_respondidas && lista.total_respondidas > 0) {
      return <Badge variant="secondary" className="bg-blue-500 text-white">Em progresso</Badge>;
    }
    return <Badge variant="secondary" className="bg-yellow-500 text-white">Não iniciada</Badge>;
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0);
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
  };

  const handleDeleteList = async (listId: number) => {
    if (!confirm("Tem certeza que deseja excluir esta lista?")) {
      return;
    }
    // TODO: Implementar exclusão de respostas_lista primeiro, depois a lista
    // Por simplicidade, aqui apenas a lista será excluída.
    const { error } = await supabase
      .from('lista')
      .delete()
      .eq('id', listId);

    if (error) {
      toast({
        title: "Erro",
        description: `Não foi possível excluir a lista: ${error.message}`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sucesso",
        description: "Lista excluída com sucesso!",
      });
      fetchListas(); // Recarregar a lista após a exclusão
    }
  };

  const handleContinueList = (listId: number) => {
    navigate(`/questoes/${listId}`); // Redirecionar para a página de questões
  };

  return (
    <div className="flex flex-col h-full bg-background p-6">
      <h1 className="text-3xl font-bold text-foreground">Listas</h1>
      <p className="text-muted-foreground mb-6">Listas de questões, provas e simulados iniciados</p>

      <div className="relative w-full max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Buscar"
          className="pl-10"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      <Card className="flex-1">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Nome</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data de criação</TableHead>
                <TableHead>Progresso</TableHead>
                <TableHead>Desempenho</TableHead>
                <TableHead>% Estudadas</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-[80px]" /></TableCell>
                  </TableRow>
                ))
              ) : listas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    Nenhuma lista encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                listas.map((lista) => (
                  <TableRow key={lista.id}>
                    <TableCell>
                      <div className="font-medium text-foreground">{lista.nome}</div>
                      <div className="text-sm text-muted-foreground">{lista.tipo_lista === 'prova' ? 'Prova' : 'Lista'}</div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(lista)}
                    </TableCell>
                    <TableCell>{new Date(lista.criado_em || '').toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>{lista.total_respondidas}/{lista.total_questoes}</TableCell>
                    <TableCell>
                      <Badge variant={lista.porcentagem_acertos && lista.porcentagem_acertos >= 70 ? "default" : "destructive"}>
                        {lista.porcentagem_acertos || 0}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={lista.porcentagem_estudada && lista.porcentagem_estudada >= 100 ? "default" : "destructive"}>
                        {lista.porcentagem_estudada || 0}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="icon" title="Continuar/Iniciar" onClick={() => handleContinueList(lista.id)}>
                          <Play className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Excluir" onClick={() => handleDeleteList(lista.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        <div className="flex items-center justify-between px-4 py-4 border-t">
          <div className="text-sm text-muted-foreground">
            Página {currentPage + 1} de {totalPages === 0 ? 1 : totalPages}
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={currentPage === 0 || loading}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage >= totalPages - 1 || loading || totalPages === 0}
            >
              Próxima
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ListasPage;
