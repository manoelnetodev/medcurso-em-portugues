import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight, MapPin, Calendar, ListChecks, ArrowRight } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom'; // Importar useNavigate

const ITEMS_PER_PAGE = 7;

const UFS_OPTIONS = [
  { label: 'Todas as UFs', value: 'all' },
  { label: 'AC', value: 'AC' },
  { label: 'AL', value: 'AL' },
  { label: 'AM', value: 'AM' },
  { label: 'AP', value: 'AP' },
  { label: 'BA', value: 'BA' },
  { label: 'CE', value: 'CE' },
  { label: 'DF', value: 'DF' },
  { label: 'ES', value: 'ES' },
  { label: 'GO', value: 'GO' },
  { label: 'MA', value: 'MA' },
  { label: 'MG', value: 'MG' },
  { label: 'MS', value: 'MS' },
  { label: 'MT', value: 'MT' },
  { label: 'PA', value: 'PA' },
  { label: 'PB', value: 'PB' },
  { label: 'PE', value: 'PE' },
  { label: 'PI', value: 'PI' },
  { label: 'PR', value: 'PR' },
  { label: 'RJ', value: 'RJ' },
  { label: 'RN', value: 'RN' },
  { label: 'RO', value: 'RO' },
  { label: 'RR', value: 'RR' },
  { label: 'RS', value: 'RS' },
  { label: 'SC', value: 'SC' },
  { label: 'SE', value: 'SE' },
  { label: 'SP', value: 'SP' },
  { label: 'TO', value: 'TO' },
  { label: 'BRASIL', value: 'BRASIL' },
];

const InstituicoesList = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate(); // Inicializar useNavigate

  const [instituicoes, setInstituicoes] = useState<Tables<'instituicoes'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [expandedInstituicaoId, setExpandedInstituicaoId] = useState<string | null>(null);
  const [provasByInstituicao, setProvasByInstituicao] = useState<Record<number, Tables<'provas'>[]>>({});
  const [loadingProvas, setLoadingProvas] = useState(false);
  const [selectedUf, setSelectedUf] = useState<string>('all');
  const [isCreatingList, setIsCreatingList] = useState(false);

  const fetchInstituicoes = useCallback(async () => {
    setLoading(true);
    const from = currentPage * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    let query = supabase
      .from('instituicoes')
      .select('*', { count: 'exact' })
      .eq('desabilitada', false)
      .order('nome', { ascending: true });

    if (searchTerm) {
      query = query.ilike('nome', `%${searchTerm}%`);
    }

    if (selectedUf !== 'all') {
      query = query.eq('uf', selectedUf);
    }

    const { data, error, count } = await query.range(from, to);

    if (error) {
      console.error('Erro ao buscar instituições:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as instituições.",
        variant: "destructive",
      });
    } else {
      setInstituicoes(data || []);
      setTotalCount(count || 0);
    }
    setLoading(false);
  }, [currentPage, searchTerm, selectedUf, toast]);

  const fetchProvasForInstituicao = useCallback(async (instituicaoId: number) => {
    setLoadingProvas(true);
    const { data, error } = await supabase
      .from('provas')
      .select('*')
      .eq('instituicao', instituicaoId)
      .order('ano', { ascending: false });

    if (error) {
      console.error(`Erro ao buscar provas para instituição ${instituicaoId}:`, error);
      toast({
        title: "Erro",
        description: `Não foi possível carregar as provas para a instituição ${instituicaoId}.`,
        variant: "destructive",
      });
    } else {
      setProvasByInstituicao(prev => ({
        ...prev,
        [instituicaoId]: data || []
      }));
    }
    setLoadingProvas(false);
  }, [toast]);

  const handleStartProva = async (prova: Tables<'provas'>) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para iniciar uma prova.",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingList(true);
    try {
      const { data: listaData, error: listaError } = await supabase
        .from('lista')
        .insert({
          nome: prova.nome || `Prova ${prova.ano} - ${prova.instituicao}`,
          tipo_lista: 'prova',
          user: user.id,
          prova: prova.id,
          finalizada: false,
          total_questoes: prova.qtd_questoes || 0,
          total_respondidas: 0,
          porcentagem_acertos: 0,
          porcentagem_estudada: 0,
          qtd_acertos: 0,
          qtd_erros: 0,
        })
        .select()
        .single();

      if (listaError || !listaData) {
        throw new Error(listaError?.message || "Erro ao criar a lista da prova.");
      }

      const newListaId = listaData.id;

      const { data: questoesData, error: questoesError } = await supabase
        .from('questoes')
        .select('id, numero, assunto, categoria, subcategoria, dif_q, discursiva') // Selecionar campos necessários para resposta_lista
        .eq('prova', prova.id);

      if (questoesError) {
        throw new Error(questoesError.message || "Erro ao buscar questões da prova.");
      }

      if (!questoesData || questoesData.length === 0) {
        toast({
          title: "Aviso",
          description: "Nenhuma questão encontrada para esta prova. A lista foi criada, mas está vazia.",
        });
        // Mesmo sem questões, podemos redirecionar para a lista vazia
        navigate(`/questoes/${newListaId}`);
        return;
      }

      const respostasParaInserir = questoesData.map(questao => ({
        lista: newListaId,
        questao: questao.id,
        user_id: user.id,
        respondeu: false,
        acertou: false,
        numero: questao.numero, // Adicionar número da questão
        assunto: questao.assunto,
        categoria: questao.categoria,
        subcategoria: questao.subcategoria,
        dificuldade: questao.dif_q,
        discursiva: questao.discursiva,
        // Outros campos podem ser nulos ou ter valores padrão
      }));

      const { error: respostasError } = await supabase
        .from('resposta_lista')
        .insert(respostasParaInserir);

      if (respostasError) {
        throw new Error(respostasError.message || "Erro ao criar respostas para as questões.");
      }

      toast({
        title: "Sucesso!",
        description: `Prova "${prova.nome}" iniciada com sucesso!`,
      });
      navigate(`/questoes/${newListaId}`); // Redirecionar para a página de questões

    } catch (error: any) {
      console.error("Erro ao iniciar prova:", error.message);
      toast({
        title: "Erro ao iniciar prova",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsCreatingList(false);
    }
  };

  useEffect(() => {
    fetchInstituicoes();
  }, [fetchInstituicoes]);

  useEffect(() => {
    if (expandedInstituicaoId) {
      const id = parseInt(expandedInstituicaoId);
      if (!isNaN(id) && !provasByInstituicao[id]) {
        fetchProvasForInstituicao(id);
      }
    }
  }, [expandedInstituicaoId, fetchProvasForInstituicao, provasByInstituicao]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0);
    setExpandedInstituicaoId(null);
  };

  const handleUfChange = (value: string) => {
    setSelectedUf(value);
    setCurrentPage(0);
    setExpandedInstituicaoId(null);
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
    setExpandedInstituicaoId(null);
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
    setExpandedInstituicaoId(null);
  };

  const handleAccordionChange = (value: string) => {
    setExpandedInstituicaoId(value === "" ? null : value);
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-2xl font-bold text-foreground">Instituições</CardTitle>
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar por nome..."
              className="pl-10"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <Select value={selectedUf} onValueChange={handleUfChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por UF" />
            </SelectTrigger>
            <SelectContent>
              {UFS_OPTIONS.map((ufOption) => (
                <SelectItem key={ufOption.value} value={ufOption.value}>
                  {ufOption.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Accordion
          type="single"
          collapsible
          value={expandedInstituicaoId || undefined}
          onValueChange={handleAccordionChange}
        >
          {loading ? (
            Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
              <div key={i} className="border-b border-border py-4">
                <Skeleton className="h-10 w-full" />
              </div>
            ))
          ) : instituicoes.length === 0 ? (
            <div className="h-24 flex items-center justify-center text-muted-foreground">
              Nenhuma instituição encontrada.
            </div>
          ) : (
            instituicoes.map((instituicao) => (
              <AccordionItem key={instituicao.id} value={instituicao.id.toString()}>
                <AccordionTrigger className="hover:no-underline data-[state=open]:bg-muted/10 rounded-t-lg">
                  <div className="flex items-center gap-3 py-2 px-4 w-full text-left">
                    <MapPin className="w-5 h-5 text-primary" />
                    <span className="font-semibold text-lg text-foreground">{instituicao.nome} - {instituicao.uf}</span>
                    {instituicao.nome_g && (
                      <span className="text-muted-foreground text-sm ml-2">
                        {instituicao.nome_g} ({instituicao.uf})
                      </span>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="bg-muted/20 p-4 rounded-b-lg border-t border-border">
                  {loadingProvas && expandedInstituicaoId === instituicao.id.toString() ? (
                    <div className="space-y-2">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ) : (
                    provasByInstituicao[instituicao.id]?.length === 0 ? (
                      <div className="text-center text-muted-foreground py-4">
                        Nenhuma prova encontrada para esta instituição.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {provasByInstituicao[instituicao.id]?.map((prova) => (
                          <div key={prova.id} className="flex items-center justify-between bg-card p-3 rounded-md shadow-sm border border-border">
                            <div className="flex items-center gap-3">
                              <span className="font-medium text-foreground">{prova.nome}</span>
                              {prova.ano && (
                                <div className="flex items-center text-muted-foreground text-sm">
                                  <Calendar className="w-4 h-4 mr-1" /> {prova.ano}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-4">
                              {prova.qtd_questoes !== null && (
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <ListChecks className="w-4 h-4 mr-1" /> {prova.qtd_questoes} questões
                                </div>
                              )}
                              <Button
                                variant="default"
                                size="sm"
                                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                                onClick={() => handleStartProva(prova)}
                                disabled={isCreatingList}
                              >
                                {isCreatingList ? "Criando..." : (prova.bloqueada ? "Ver Detalhes" : "Iniciar")} <ArrowRight className="w-4 h-4 ml-2" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  )}
                </AccordionContent>
              </AccordionItem>
            ))
          )}
        </Accordion>

        <div className="flex items-center justify-between px-2 py-4">
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
              <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage >= totalPages - 1 || loading || totalPages === 0}
            >
              Próxima <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InstituicoesList;
