import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  BookOpen,
  Clock,
  Award,
  AlertTriangle,
  Eye,
  CheckCircle,
  XCircle,
  Lightbulb
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ListaResult {
  id: number;
  nome: string;
  qtd_acertos: number;
  qtd_erros: number;
  total_respondidas: number;
  porcentagem_estudada: number;
  finalizada: boolean;
}

interface QuestionResult {
  id: number;
  numero: number;
  respondeu: boolean;
  acertou: boolean;
  motivo_erro: string;
  estudou: boolean;
  questoes: {
    categoria: number;
    subcategoria: number;
    assunto: number;
    anulada: boolean;
    numero: number;
    enunciado: string;
  } | null;
  categoria_nome?: string;
  subcategoria_nome?: string;
  assunto_nome?: string;
}

interface ErrorStats {
  FC: number; // Falta de Conhecimento
  FA: number; // Falta de Atenção  
  FR: number; // Falta de Revisão
  CA: number; // Confusão de Alternativas
}

interface CategoryStats {
  nome: string;
  acertos: number;
  erros: number;
  total: number;
  percentual: number;
}

const ResultsPage = () => {
  const { listId } = useParams<{ listId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [lista, setLista] = useState<ListaResult | null>(null);
  const [questoes, setQuestoes] = useState<QuestionResult[]>([]);
  const [errorStats, setErrorStats] = useState<ErrorStats>({ FC: 0, FA: 0, FR: 0, CA: 0 });
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [subcategoryStats, setSubcategoryStats] = useState<CategoryStats[]>([]);
  const [subjectStats, setSubjectStats] = useState<CategoryStats[]>([]);

  useEffect(() => {
    if (!listId || !user) return;
    fetchResults();
  }, [listId, user]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      
      // Buscar dados da lista
      const { data: listaData, error: listaError } = await supabase
        .from('lista')
        .select('*')
        .eq('id', parseInt(listId!))
        .single();
      
      if (listaError) throw listaError;
      setLista(listaData);

      // Buscar questões e respostas
      const { data: questoesData, error: questoesError } = await supabase
        .from('resposta_lista')
        .select(`
          *,
          questoes (
            categoria,
            subcategoria, 
            assunto,
            anulada,
            numero,
            enunciado
          )
        `)
        .eq('lista', parseInt(listId!))
        .eq('user_id', user.id)
        .order('numero', { ascending: true });

      if (questoesError) throw questoesError;

      // Buscar nomes das categorias, subcategorias e assuntos
      const questoesWithNames = await Promise.all(
        questoesData.map(async (q) => {
          let categoria_nome = '';
          let subcategoria_nome = '';
          let assunto_nome = '';

          if (q.questoes?.categoria) {
            const { data: cat } = await supabase
              .from('categoria')
              .select('nome')
              .eq('id', q.questoes.categoria)
              .single();
            categoria_nome = cat?.nome || '';
          }

          if (q.questoes?.subcategoria) {
            const { data: subcat } = await supabase
              .from('subcategoria')
              .select('nome')
              .eq('id', q.questoes.subcategoria)
              .single();
            subcategoria_nome = subcat?.nome || '';
          }

          if (q.questoes?.assunto) {
            const { data: assunto } = await supabase
              .from('assunto')
              .select('nome')
              .eq('id', q.questoes.assunto)
              .single();
            assunto_nome = assunto?.nome || '';
          }

          return {
            ...q,
            categoria_nome,
            subcategoria_nome,
            assunto_nome
          };
        })
      );

      setQuestoes(questoesWithNames);
      calculateStats(questoesWithNames);
      
    } catch (error: any) {
      toast({
        title: "Erro ao carregar resultados",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (questoesData: QuestionResult[]) => {
    // Estatísticas de erros
    const errors: ErrorStats = { FC: 0, FA: 0, FR: 0, CA: 0 };
    questoesData.forEach(q => {
      if (q.motivo_erro && errors.hasOwnProperty(q.motivo_erro)) {
        errors[q.motivo_erro as keyof ErrorStats]++;
      }
    });
    setErrorStats(errors);

    // Estatísticas por categoria
    const categoryMap = new Map<string, { acertos: number; erros: number; total: number }>();
    const subcategoryMap = new Map<string, { acertos: number; erros: number; total: number }>();
    const subjectMap = new Map<string, { acertos: number; erros: number; total: number }>();

    questoesData.forEach(q => {
      if (q.respondeu) {
        // Por categoria
        if (q.categoria_nome) {
          const current = categoryMap.get(q.categoria_nome) || { acertos: 0, erros: 0, total: 0 };
          current.total++;
          if (q.acertou) current.acertos++;
          else current.erros++;
          categoryMap.set(q.categoria_nome, current);
        }

        // Por subcategoria
        if (q.subcategoria_nome) {
          const current = subcategoryMap.get(q.subcategoria_nome) || { acertos: 0, erros: 0, total: 0 };
          current.total++;
          if (q.acertou) current.acertos++;
          else current.erros++;
          subcategoryMap.set(q.subcategoria_nome, current);
        }

        // Por assunto
        if (q.assunto_nome) {
          const current = subjectMap.get(q.assunto_nome) || { acertos: 0, erros: 0, total: 0 };
          current.total++;
          if (q.acertou) current.acertos++;
          else current.erros++;
          subjectMap.set(q.assunto_nome, current);
        }
      }
    });

    // Converter para arrays e calcular percentuais
    const categoryStats = Array.from(categoryMap.entries()).map(([nome, stats]) => ({
      nome,
      ...stats,
      percentual: Math.round((stats.acertos / stats.total) * 100)
    })).sort((a, b) => b.percentual - a.percentual);

    const subcategoryStats = Array.from(subcategoryMap.entries()).map(([nome, stats]) => ({
      nome,
      ...stats,
      percentual: Math.round((stats.acertos / stats.total) * 100)
    })).sort((a, b) => b.percentual - a.percentual);

    const subjectStats = Array.from(subjectMap.entries()).map(([nome, stats]) => ({
      nome,
      ...stats,
      percentual: Math.round((stats.acertos / stats.total) * 100)
    })).sort((a, b) => b.percentual - a.percentual);

    setCategoryStats(categoryStats);
    setSubcategoryStats(subcategoryStats);
    setSubjectStats(subjectStats);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground font-medium">Carregando resultados...</p>
        </div>
      </div>
    );
  }

  if (!lista) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md mx-auto p-6">
          <AlertTriangle className="h-16 w-16 text-muted-foreground mx-auto" />
          <h2 className="text-xl font-semibold text-foreground">Lista não encontrada</h2>
          <p className="text-muted-foreground">Não foi possível carregar os resultados desta lista.</p>
          <Button onClick={() => navigate('/listas')} className="mt-4">
            Voltar às Listas
          </Button>
        </div>
      </div>
    );
  }

  const totalQuestoes = questoes.length;
  const totalRespondidas = questoes.filter(q => q.respondeu).length;
  const percentualAcertos = totalRespondidas > 0 ? Math.round((lista.qtd_acertos / totalRespondidas) * 100) : 0;
  const percentualErros = totalRespondidas > 0 ? Math.round((lista.qtd_erros / totalRespondidas) * 100) : 0;
  const questoesEstudadas = questoes.filter(q => q.estudou).length;
  const percentualEstudadas = questoesEstudadas > 0 ? Math.round((questoesEstudadas / totalQuestoes) * 100) : 0;

  return (
    <div className="space-y-6">
        
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/listas')}
              className="rounded-lg"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <p className="text-muted-foreground text-sm">{lista.nome}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-lg"
              onClick={() => navigate(`/questoes/${listId}`)}
            >
              <Eye className="w-4 h-4 mr-2" />
              Ver Questões
            </Button>
          </div>
        </div>

        <div className="space-y-8">
            {/* Cards principais - Redesign */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Percentual de Acertos */}
              <Card className="rounded-xl border-0 shadow-lg bg-gradient-to-br from-success/5 to-success/10 border border-success/20">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-success">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Percentual de Acertos</span>
                      </div>
                      <div className="text-4xl font-bold text-success">{percentualAcertos}%</div>
                      <div className="text-sm text-muted-foreground">
                        Acertos: {lista.qtd_acertos}
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-success" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Percentual de Erros */}
              <Card className="rounded-xl border-0 shadow-lg bg-gradient-to-br from-destructive/5 to-destructive/10 border border-destructive/20">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-destructive">
                        <XCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Percentual de Erros</span>
                      </div>
                      <div className="text-4xl font-bold text-destructive">{percentualErros}%</div>
                      <div className="text-sm text-muted-foreground">
                        Erros: {lista.qtd_erros}
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center">
                      <XCircle className="w-6 h-6 text-destructive" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Questões Estudadas */}
              <Card className="rounded-xl border-0 shadow-lg bg-gradient-to-br from-purple-500/5 to-purple-500/10 border border-purple-500/20">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-purple-500">
                        <BookOpen className="w-4 h-4" />
                        <span className="text-sm font-medium">% Acertos em Estudadas</span>
                      </div>
                      <div className="text-4xl font-bold text-purple-500">{percentualEstudadas}%</div>
                      <div className="text-sm text-muted-foreground">
                        {questoesEstudadas}/{totalQuestoes}
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-purple-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Estatísticas por Categoria - Redesign */}
            {categoryStats.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {categoryStats.slice(0, 5).map((cat, index) => (
                  <Card key={cat.nome} className="rounded-xl border-0 shadow-lg bg-gradient-to-br from-card to-card/50 hover:shadow-xl transition-shadow">
                    <CardContent className="p-5">
                      <div className="space-y-3">
                        <div className="text-center">
                          <h3 className="text-sm font-semibold text-foreground mb-1">{cat.nome}</h3>
                          <div className="text-xs text-muted-foreground">{cat.acertos} de {cat.total}</div>
                        </div>
                        
                        <div className="text-center">
                          <div className={cn(
                            "text-3xl font-bold mb-2",
                            cat.percentual >= 70 ? "text-success" : 
                            cat.percentual >= 50 ? "text-yellow-500" : "text-destructive"
                          )}>
                            {cat.percentual}%
                          </div>
                        </div>
                        
                        {/* Progress Ring Mini */}
                        <div className="flex justify-center">
                          <div className="relative w-12 h-12">
                            <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 48 48">
                              <circle
                                cx="24"
                                cy="24"
                                r="20"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                                className="text-muted/20"
                              />
                              <circle
                                cx="24"
                                cy="24"
                                r="20"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                                strokeDasharray={`${(cat.percentual * 125.6) / 100} 125.6`}
                                className={cn(
                                  "transition-all duration-1000 ease-out",
                                  cat.percentual >= 70 ? "text-success" : 
                                  cat.percentual >= 50 ? "text-yellow-500" : "text-destructive"
                                )}
                                strokeLinecap="round"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className={cn(
                                "w-2 h-2 rounded-full",
                                cat.percentual >= 70 ? "bg-success" : 
                                cat.percentual >= 50 ? "bg-yellow-500" : "bg-destructive"
                              )}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="rounded-xl border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
                <CardContent className="p-12">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mb-4">
                      <BarChart3 className="w-10 h-10 text-muted-foreground/50" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Dados insuficientes
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-md">
                      Responda mais questões para ver a análise detalhada por categoria. 
                      Precisamos de pelo menos algumas respostas para gerar as estatísticas.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Análise de Erros e Insights */}
            <Card className="rounded-xl border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  Análise de Erros e Oportunidades
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 bg-gradient-to-r from-blue-500/10 to-blue-500/5 rounded-lg border border-blue-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-semibold text-blue-600">Falta de Conhecimento</div>
                      <BookOpen className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="text-2xl font-bold text-blue-500 mb-1">{errorStats.FC}</div>
                    <div className="text-xs text-muted-foreground">
                      {lista.qtd_erros > 0 ? Math.round((errorStats.FC / lista.qtd_erros) * 100) : 0}% dos erros
                    </div>
                    <Progress value={lista.qtd_erros > 0 ? (errorStats.FC / lista.qtd_erros) * 100 : 0} className="h-1 mt-2" />
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 rounded-lg border border-yellow-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-semibold text-yellow-600">Falta de Atenção</div>
                      <Eye className="w-4 h-4 text-yellow-500" />
                    </div>
                    <div className="text-2xl font-bold text-yellow-500 mb-1">{errorStats.FA}</div>
                    <div className="text-xs text-muted-foreground">
                      {lista.qtd_erros > 0 ? Math.round((errorStats.FA / lista.qtd_erros) * 100) : 0}% dos erros
                    </div>
                    <Progress value={lista.qtd_erros > 0 ? (errorStats.FA / lista.qtd_erros) * 100 : 0} className="h-1 mt-2" />
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-purple-500/10 to-purple-500/5 rounded-lg border border-purple-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-semibold text-purple-600">Falta de Revisão</div>
                      <Clock className="w-4 h-4 text-purple-500" />
                    </div>
                    <div className="text-2xl font-bold text-purple-500 mb-1">{errorStats.FR}</div>
                    <div className="text-xs text-muted-foreground">
                      {lista.qtd_erros > 0 ? Math.round((errorStats.FR / lista.qtd_erros) * 100) : 0}% dos erros
                    </div>
                    <Progress value={lista.qtd_erros > 0 ? (errorStats.FR / lista.qtd_erros) * 100 : 0} className="h-1 mt-2" />
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-pink-500/10 to-pink-500/5 rounded-lg border border-pink-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-semibold text-pink-600">Chutei e Acertei</div>
                      <Award className="w-4 h-4 text-pink-500" />
                    </div>
                    <div className="text-2xl font-bold text-pink-500 mb-1">{errorStats.CA}</div>
                    <div className="text-xs text-muted-foreground">
                      {lista.qtd_acertos > 0 ? Math.round((errorStats.CA / lista.qtd_acertos) * 100) : 0}% dos acertos
                    </div>
                    <Progress value={lista.qtd_acertos > 0 ? (errorStats.CA / lista.qtd_acertos) * 100 : 0} className="h-1 mt-2" />
                  </div>
                </div>

                {/* Insights e Recomendações */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border/30">
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-yellow-500" />
                      Pontos Fortes
                    </h4>
                    <div className="space-y-2">
                      {categoryStats.filter(c => c.percentual >= 70).slice(0, 3).length > 0 ? (
                        categoryStats.filter(c => c.percentual >= 70).slice(0, 3).map(category => (
                          <div key={category.nome} className="flex items-center gap-2 p-2 bg-success/10 rounded-lg">
                            <CheckCircle className="w-4 h-4 text-success" />
                            <div>
                              <div className="text-sm font-medium text-foreground">{category.nome}</div>
                              <div className="text-xs text-muted-foreground">{category.percentual}% de acertos</div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center py-6 px-4">
                          <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mb-3">
                            <TrendingUp className="w-8 h-8 text-muted-foreground/50" />
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-medium text-muted-foreground mb-1">
                              Nenhum ponto forte identificado
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Continue estudando para alcançar 70% ou mais em alguma categoria
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Target className="w-4 h-4 text-orange-500" />
                      Áreas para Melhoria
                    </h4>
                    <div className="space-y-2">
                      {categoryStats.filter(c => c.percentual < 70).slice(0, 3).length > 0 ? (
                        categoryStats.filter(c => c.percentual < 70).slice(0, 3).map(category => (
                          <div key={category.nome} className="flex items-center gap-2 p-2 bg-orange-500/10 rounded-lg">
                            <AlertTriangle className="w-4 h-4 text-orange-500" />
                            <div>
                              <div className="text-sm font-medium text-foreground">{category.nome}</div>
                              <div className="text-xs text-muted-foreground">{category.percentual}% de acertos</div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center py-6 px-4">
                          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mb-3">
                            <Award className="w-8 h-8 text-success/70" />
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-medium text-success mb-1">
                              Parabéns! Performance excelente
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Todas as categorias estão com 70% ou mais de aproveitamento
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          
          {/* Gráfico de Performance por Tempo */}
          <Card className="rounded-xl border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Performance Geral
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Métricas principais */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-success/10 to-success/5 rounded-lg border border-success/20">
                    <div>
                      <div className="text-sm text-muted-foreground">Taxa de Aproveitamento</div>
                      <div className="text-2xl font-bold text-success">{percentualAcertos}%</div>
                    </div>
                    <div className="text-success">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500/10 to-blue-500/5 rounded-lg border border-blue-500/20">
                    <div>
                      <div className="text-sm text-muted-foreground">Questões Respondidas</div>
                      <div className="text-2xl font-bold text-blue-500">{totalRespondidas}/{totalQuestoes}</div>
                    </div>
                    <div className="text-blue-500">
                      <Target className="w-8 h-8" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-500/10 to-purple-500/5 rounded-lg border border-purple-500/20">
                    <div>
                      <div className="text-sm text-muted-foreground">Conteúdo Estudado</div>
                      <div className="text-2xl font-bold text-purple-500">{percentualEstudadas}%</div>
                    </div>
                    <div className="text-purple-500">
                      <BookOpen className="w-8 h-8" />
                    </div>
                  </div>
                </div>

                {/* Progress Ring Visual */}
                <div className="flex items-center justify-center">
                  <div className="relative w-48 h-48">
                    <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 200 200">
                      {/* Background circle */}
                      <circle
                        cx="100"
                        cy="100"
                        r="80"
                        stroke="currentColor"
                        strokeWidth="10"
                        fill="none"
                        className="text-muted/20"
                      />
                      {/* Progress circle */}
                      <circle
                        cx="100"
                        cy="100"
                        r="80"
                        stroke="currentColor"
                        strokeWidth="10"
                        fill="none"
                        strokeDasharray={`${(percentualAcertos * 502.4) / 100} 502.4`}
                        className="text-success transition-all duration-1000 ease-out"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-success">{percentualAcertos}%</div>
                        <div className="text-sm text-muted-foreground">Aproveitamento</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Análise Detalhada por Categoria */}
          <Card className="rounded-xl border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Análise por Categoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryStats.map((category, index) => (
                  <div key={category.nome} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {category.nome}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {category.acertos}/{category.total} questões
                        </span>
                      </div>
                      <div className={cn(
                        "text-sm font-bold",
                        category.percentual >= 70 ? "text-success" : 
                        category.percentual >= 50 ? "text-yellow-500" : "text-destructive"
                      )}>
                        {category.percentual}%
                      </div>
                    </div>
                    <Progress 
                      value={category.percentual} 
                      className="h-2 rounded-lg" 
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tabela de Resultados por Assunto */}
          <Card className="rounded-xl border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Detalhamento por Assunto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-3 text-sm font-semibold text-muted-foreground">Assunto</th>
                      <th className="text-center py-3 text-sm font-semibold text-muted-foreground">% de Acertos</th>
                      <th className="text-center py-3 text-sm font-semibold text-muted-foreground">Acertos</th>
                      <th className="text-center py-3 text-sm font-semibold text-muted-foreground">Erros</th>
                      <th className="text-left py-3 text-sm font-semibold text-muted-foreground">Categoria</th>
                      <th className="text-left py-3 text-sm font-semibold text-muted-foreground">Subcategoria</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjectStats.map((subject, index) => (
                      <tr key={subject.nome} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                        <td className="py-3 text-sm font-medium text-foreground">{subject.nome}</td>
                        <td className="text-center py-3">
                          <div className="flex items-center justify-center gap-2">
                            <span className={cn(
                              "text-sm font-bold",
                              subject.percentual >= 70 ? "text-success" : 
                              subject.percentual >= 50 ? "text-yellow-500" : "text-destructive"
                            )}>
                              {subject.percentual}%
                            </span>
                            <Progress 
                              value={subject.percentual} 
                              className="w-16 h-2" 
                            />
                          </div>
                        </td>
                        <td className="text-center py-3 text-sm text-muted-foreground">{subject.acertos}</td>
                        <td className="text-center py-3 text-sm text-muted-foreground">{subject.erros}</td>
                        <td className="py-3 text-sm text-muted-foreground">
                          {categoryStats.find(c => 
                            questoes.some(q => q.assunto_nome === subject.nome && q.categoria_nome === c.nome)
                          )?.nome || '-'}
                        </td>
                        <td className="py-3 text-sm text-muted-foreground">
                          {subcategoryStats.find(s => 
                            questoes.some(q => q.assunto_nome === subject.nome && q.subcategoria_nome === s.nome)
                          )?.nome || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
                          </CardContent>
            </Card>

            {/* Resumo e Próximos Passos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Summary Card */}
              <Card className="rounded-xl border-0 shadow-lg bg-gradient-to-br from-primary/10 to-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary" />
                    Resumo da Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                      <span className="text-sm text-muted-foreground">Status da Lista</span>
                      <Badge variant={lista.finalizada ? "default" : "secondary"}>
                        {lista.finalizada ? "Concluída" : "Em Progresso"}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                      <span className="text-sm text-muted-foreground">Nota Estimada</span>
                      <span className={cn(
                        "text-lg font-bold",
                        percentualAcertos >= 70 ? "text-success" : 
                        percentualAcertos >= 50 ? "text-yellow-500" : "text-destructive"
                      )}>
                        {percentualAcertos >= 90 ? "A" : 
                         percentualAcertos >= 80 ? "B" : 
                         percentualAcertos >= 70 ? "C" : 
                         percentualAcertos >= 60 ? "D" : "F"}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                      <span className="text-sm text-muted-foreground">Questões Estudadas</span>
                      <span className="text-lg font-bold text-purple-500">
                        {questoesEstudadas}/{totalQuestoes}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                      <span className="text-sm text-muted-foreground">Tempo Médio por Questão</span>
                      <span className="text-lg font-bold text-blue-500">
                        ~ 2min
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recomendações */}
              <Card className="rounded-xl border-0 shadow-lg bg-gradient-to-br from-success/10 to-success/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                    Recomendações de Estudo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {percentualAcertos < 70 && (
                      <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5" />
                          <div>
                            <div className="text-sm font-medium text-foreground">Revisar Conteúdo</div>
                            <div className="text-xs text-muted-foreground">
                              Recomendamos revisar os temas com menor aproveitamento antes de continuar.
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {errorStats.FC > errorStats.FA && errorStats.FC > errorStats.FR && (
                      <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <div className="flex items-start gap-2">
                          <BookOpen className="w-4 h-4 text-blue-500 mt-0.5" />
                          <div>
                            <div className="text-sm font-medium text-foreground">Foco no Estudo Teórico</div>
                            <div className="text-xs text-muted-foreground">
                              A maioria dos erros são por falta de conhecimento. Priorize o estudo da teoria.
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {errorStats.FA > errorStats.FC && errorStats.FA > errorStats.FR && (
                      <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                        <div className="flex items-start gap-2">
                          <Eye className="w-4 h-4 text-yellow-500 mt-0.5" />
                          <div>
                            <div className="text-sm font-medium text-foreground">Melhorar Concentração</div>
                            <div className="text-xs text-muted-foreground">
                              Muitos erros por desatenção. Tente fazer as questões com mais calma.
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {percentualEstudadas < 50 && (
                      <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                        <div className="flex items-start gap-2">
                          <Target className="w-4 h-4 text-purple-500 mt-0.5" />
                          <div>
                            <div className="text-sm font-medium text-foreground">Aumentar Dedicação</div>
                            <div className="text-xs text-muted-foreground">
                              Marque mais questões como "estudadas" para acompanhar seu progresso.
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {percentualAcertos >= 80 && (
                      <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-success mt-0.5" />
                          <div>
                            <div className="text-sm font-medium text-foreground">Excelente Performance!</div>
                            <div className="text-xs text-muted-foreground">
                              Continue assim! Considere avançar para temas mais desafiadores.
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
        </div>
    </div>
  );
};

export default ResultsPage; 