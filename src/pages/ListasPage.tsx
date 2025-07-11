import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Play, Trash2, BookOpen, Clock, Target, BarChart3, Calendar, Filter, MoreHorizontal, ArrowUpDown } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { formatPercentage, cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

const ITEMS_PER_PAGE = 10;

const ListasPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

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
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <Target className="w-3 h-3 mr-1" />
          Finalizada
        </Badge>
      );
    }
    if (lista.total_respondidas && lista.total_respondidas > 0) {
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <Clock className="w-3 h-3 mr-1" />
          Em progresso
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
        <BookOpen className="w-3 h-3 mr-1" />
        Não iniciada
      </Badge>
    );
  };

  const getCategoryColor = (tipo: string) => {
    const colors = {
      'prova': 'bg-primary/10 text-primary border-primary/20',
      'lista': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      'default': 'bg-muted text-muted-foreground border-muted'
    };
    return colors[tipo as keyof typeof colors] || colors.default;
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0);
  };

  const handleDeleteList = async (listId: number) => {
    if (!confirm("Tem certeza que deseja excluir esta lista?")) {
      return;
    }
    
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
      fetchListas();
    }
  };

  const handleContinueList = (listId: number) => {
    navigate(`/questoes/${listId}`);
  };

  const handleViewResults = (listId: number) => {
    navigate(`/resultados/${listId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header com busca */}
      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar listas..."
            className="pl-10"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
        </div>
      </div>

      {/* Tabela */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Lista</TableHead>
              <TableHead>Progresso</TableHead>
              <TableHead>Última atividade</TableHead>
              <TableHead>Categorias</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-muted animate-pulse rounded-full"></div>
                      <div>
                        <div className="h-4 w-32 bg-muted animate-pulse rounded mb-1"></div>
                        <div className="h-3 w-20 bg-muted animate-pulse rounded"></div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-16 bg-muted animate-pulse rounded"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-20 bg-muted animate-pulse rounded"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-6 w-16 bg-muted animate-pulse rounded"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-8 w-8 bg-muted animate-pulse rounded ml-auto"></div>
                  </TableCell>
                </TableRow>
              ))
            ) : listas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <BookOpen className="h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      {searchTerm ? 'Nenhuma lista encontrada.' : 'Você ainda não tem listas.'}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              listas.map((lista) => {
                const progressPercent = lista.total_questoes ? (lista.total_respondidas || 0) / lista.total_questoes * 100 : 0;
                const accuracyPercent = lista.porcentagem_acertos || 0;
                
                return (
                  <TableRow key={lista.id} className="group hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                            {lista.nome.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground leading-none">{lista.nome}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {lista.total_questoes || 0} questões
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16">
                          <Progress value={progressPercent} className="h-2" />
                        </div>
                        <span className="text-sm font-medium text-foreground min-w-0">
                          {Math.round(progressPercent)}%
                        </span>
                        {lista.finalizada && (
                          <span className="text-green-600 text-xs">• {Math.round(accuracyPercent)}% acertos</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(lista.criado_em || '')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {getStatusBadge(lista)}
                        <Badge variant="outline" className={getCategoryColor(lista.tipo_lista || 'default')}>
                          {lista.tipo_lista === 'prova' ? 'Prova' : 'Lista'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleContinueList(lista.id)}
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                        
                        {lista.finalizada && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewResults(lista.id)}
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <BarChart3 className="h-4 w-4" />
                          </Button>
                        )}

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleContinueList(lista.id)}>
                              <Play className="mr-2 h-4 w-4" />
                              Continuar
                            </DropdownMenuItem>
                            {lista.finalizada && (
                              <DropdownMenuItem onClick={() => handleViewResults(lista.id)}>
                                <BarChart3 className="mr-2 h-4 w-4" />
                                Ver resultados
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteList(lista.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Página {currentPage + 1} de {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              disabled={currentPage === 0 || loading}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
              disabled={currentPage >= totalPages - 1 || loading}
            >
              Próximo
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListasPage;
