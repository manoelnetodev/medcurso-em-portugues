import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2, BookOpen, Clock, Target, BarChart3, Settings, MessageSquare, AlertTriangle, SkipForward, ArrowLeft } from 'lucide-react';
import { TopBar } from '@/components/answer-question/TopBar';
import { QuestionNavigator } from '@/components/answer-question/QuestionNavigator';
import { QuestionContent } from '@/components/answer-question/QuestionContent';
import { ResponseCard } from '@/components/answer-question/ResponseCard';
import { QuestionTimer } from '@/components/answer-question/QuestionTimer';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { cn } from '@/lib/utils';

export interface QuestionDetails extends Tables<'questoes'> {
  alternativas: Tables<'alternativas'>[];
}

export interface RespostaListaWithQuestion extends Tables<'resposta_lista'> {
  questoes: QuestionDetails | null;
}

const AnswerQuestionPage = () => {
  const { listId } = useParams<{ listId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [respostasLista, setRespostasLista] = useState<RespostaListaWithQuestion[]>([]);
  const [selectedAnswerId, setSelectedAnswerId] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorReason, setErrorReason] = useState<Tables<'resposta_lista'>['motivo_erro']>(null);
  const [listName, setListName] = useState<string>('Lista');
  const [showTimer, setShowTimer] = useState(false);
  const [shouldScrollTop, setShouldScrollTop] = useState(true);

  const currentQuestion = respostasLista[currentQuestionIndex]?.questoes || null;

  const fetchListData = useCallback(async () => {
    if (!listId || !user) return;
    setLoading(true);
    try {
      // Buscar nome da lista
      const { data: listaData, error: listaError } = await supabase
        .from('lista')
        .select('nome')
        .eq('id', parseInt(listId))
        .single();
      if (!listaError && listaData?.nome) {
        setListName(listaData.nome);
      }

      const { data, error } = await supabase
        .from('resposta_lista')
        .select(`*, questoes (*, alternativas (*))`)
        .eq('lista', parseInt(listId))
        .eq('user_id', user.id)
        .order('numero', { ascending: true });

      if (error) throw new Error(error.message);
      if (!data || data.length === 0) {
        toast({ title: "Erro", description: "Lista de questões não encontrada.", variant: "destructive" });
        navigate('/listas');
        return;
      }

      const formatted = data.map(resp => ({
        ...resp,
        questoes: resp.questoes ? { ...resp.questoes, alternativas: resp.questoes.alternativas?.sort((a, b) => a.id - b.id) || [] } : null
      })) as RespostaListaWithQuestion[];
      
      setRespostasLista(formatted);
    } catch (err: any) {
      toast({ title: "Erro ao carregar lista", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [listId, user, toast, navigate]);

  // Função para atualizar apenas respostasLista após update do motivo do erro
  const fetchRespostasLista = useCallback(async () => {
    if (!listId || !user) return;
    const { data, error } = await supabase
      .from('resposta_lista')
      .select('*, questoes (*, alternativas (*))')
      .eq('lista', parseInt(listId))
      .eq('user_id', user.id)
      .order('numero', { ascending: true });
    if (!error && data) {
      const formatted = data.map(resp => ({
        ...resp,
        questoes: resp.questoes ? { ...resp.questoes, alternativas: resp.questoes.alternativas?.sort((a, b) => a.id - b.id) || [] } : null
      })) as RespostaListaWithQuestion[];
      setRespostasLista(formatted);
    }
  }, [listId, user]);

  useEffect(() => {
    fetchListData();
  }, [fetchListData]);

  const updateCurrentQuestionState = useCallback((index: number) => {
    if (respostasLista.length > 0) {
      const currentResp = respostasLista[index];
      setSelectedAnswerId(currentResp?.alternativa_select || null);
      setShowResult(currentResp?.respondeu || false);
      setErrorReason(currentResp?.motivo_erro || null);
    }
  }, [respostasLista]);

  useEffect(() => {
    updateCurrentQuestionState(currentQuestionIndex);
  }, [currentQuestionIndex, updateCurrentQuestionState]);

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Verificar se não está em um input ou textarea
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // Tecla R para ver resultados
      if (event.key.toLowerCase() === 'r' && !event.ctrlKey && !event.altKey && !event.metaKey) {
        event.preventDefault();
        toast({
          title: "Navegando para resultados",
          description: "Atalho ativado: Tecla R",
          variant: "default"
        });
        navigate(`/resultados/${listId}`);
      }
      
      // Tecla ESC para voltar às listas
      if (event.key === 'Escape' && !event.ctrlKey && !event.altKey && !event.metaKey) {
        event.preventDefault();
        toast({
          title: "Voltando às listas",
          description: "Atalho ativado: Tecla ESC",
          variant: "default"
        });
        navigate('/listas');
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [navigate, listId, toast]);

  // Scroll para o topo ao trocar de questão, se permitido
  useEffect(() => {
    if (shouldScrollTop) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setShouldScrollTop(true); // resetar para padrão após cada troca
  }, [currentQuestionIndex]);

  const handleAnswerSelect = (answerId: number) => {
    if (!showResult) setSelectedAnswerId(answerId);
  };

  const handleSubmit = async () => {
    if (!user || !listId || !currentQuestion || selectedAnswerId === null) {
      toast({ title: "Aviso", description: "Selecione uma alternativa.", variant: "default" });
      return;
    }

    setSubmitting(true);
    try {
      let isCorrect = currentQuestion.alternativa_Correta === selectedAnswerId;
      if (currentQuestion.anulada) isCorrect = true;

      const currentRespostaId = respostasLista[currentQuestionIndex].id;
      const { error } = await supabase
        .from('resposta_lista')
        .update({
          respondeu: true,
          acertou: isCorrect,
          alternativa_select: selectedAnswerId,
          data_resposta: new Date().toISOString(),
          motivo_erro: isCorrect ? null : errorReason,
        })
        .eq('id', currentRespostaId);

      if (error) throw new Error(error.message);

      // Atualizar agregados da lista
      // Buscar todas as respostas da lista para o usuário
      const { data: respostas, error: fetchError } = await supabase
        .from('resposta_lista')
        .select('id, respondeu, acertou, estudou')
        .eq('lista', parseInt(listId))
        .eq('user_id', user.id);
      if (fetchError) throw new Error(fetchError.message);
      const respondidas = respostas.filter(r => r.respondeu);
      const acertos = respondidas.filter(r => r.acertou).length;
      const erros = respondidas.filter(r => r.respondeu && !r.acertou).length;
      const estudadas = respostas.filter(r => r.estudou).length;
      const totalRespondidas = respondidas.length;
      const totalQuestoes = respostas.length;
      const porcentagemEstudada = totalQuestoes > 0 ? (estudadas / totalQuestoes) * 100 : 0;
      const finalizada = totalRespondidas === totalQuestoes && totalQuestoes > 0;

      const { error: listaError } = await supabase
        .from('lista')
        .update({
          qtd_acertos: acertos,
          qtd_erros: erros,
          total_respondidas: totalRespondidas,
          porcentagem_estudada: porcentagemEstudada,
          finalizada: finalizada,
        })
        .eq('id', parseInt(listId));
      if (listaError) throw new Error(listaError.message);

      setRespostasLista(prev => {
        const newRespostas = [...prev];
        newRespostas[currentQuestionIndex] = {
          ...newRespostas[currentQuestionIndex],
          respondeu: true,
          acertou: isCorrect,
          alternativa_select: selectedAnswerId,
        };
        return newRespostas;
      });

      setShowResult(true);
      toast({
        title: isCorrect ? "Resposta Correta!" : "Resposta Incorreta.",
        variant: isCorrect ? "default" : "destructive",
      });
    } catch (err: any) {
      toast({ title: "Erro ao submeter", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  // Navegação entre questões
  const handleNavigate = (newIndex: number, scrollTop = true) => {
    if (newIndex >= 0 && newIndex < respostasLista.length) {
      setShouldScrollTop(scrollTop);
      setCurrentQuestionIndex(newIndex);
    } else if (newIndex >= respostasLista.length) {
      toast({ title: "Fim da Lista", description: "Você respondeu todas as questões!" });
      navigate('/listas');
    }
  };

  const handleTimerToggle = () => {
    setShowTimer(!showTimer);
  };

  const handleTimeUp = () => {
    toast({ 
      title: "Tempo Esgotado", 
      description: "O tempo limite foi atingido. Considere finalizar a questão.", 
      variant: "destructive" 
    });
  };

  const handleSkipQuestion = () => {
    if (currentQuestionIndex + 1 < totalQuestions) {
      handleNavigate(currentQuestionIndex + 1);
      toast({ 
        title: "Questão pulada", 
        description: "Você pode voltar a ela mais tarde.", 
        variant: "default" 
      });
    } else {
      toast({ 
        title: "Última questão", 
        description: "Esta é a última questão da lista.", 
        variant: "default" 
      });
    }
  };

  const motivoErroOptions = [
    { label: 'Falta de Conhecimento (FC)', value: 'FC' as const },
    { label: 'Falta de Atenção (FA)', value: 'FA' as const },
    { label: 'Falta de Revisão (FR)', value: 'FR' as const },
    { label: 'Confusão de Alternativas (CA)', value: 'CA' as const },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl"></div>
          </div>
          <p className="text-muted-foreground font-medium">Carregando questões...</p>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md mx-auto p-6">
          <AlertTriangle className="h-16 w-16 text-muted-foreground mx-auto" />
          <h2 className="text-xl font-semibold text-foreground">Erro ao carregar questão</h2>
          <p className="text-muted-foreground">Não foi possível carregar a questão. Tente novamente.</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  const totalQuestions = respostasLista.length;
  const answeredQuestions = respostasLista.filter(r => r.respondeu).length;
  const correctAnswers = respostasLista.filter(r => r.acertou).length;
  const progressPercentage = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;
  const accuracyPercentage = answeredQuestions > 0 ? (correctAnswers / answeredQuestions) * 100 : 0;
  const isCurrentQuestionAnsweredCorrectly = respostasLista[currentQuestionIndex]?.acertou || false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Progress Bar */}
      <div className="bg-background/95 backdrop-blur border-b border-border/40 sticky top-0 z-20">
        <div className="px-4 sm:px-6">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              {/* Botão Voltar */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/listas')}
                className="text-muted-foreground hover:text-foreground h-9 px-2 rounded-lg"
                title="Voltar para Listas (ESC)"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <span className="text-lg font-semibold text-foreground">{listName}</span>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <span>Questão {currentQuestionIndex + 1} de {totalQuestions}</span>
                    <div className="w-40 h-2 bg-muted rounded-lg overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-300 ease-out rounded-lg"
                        style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
                      />
                    </div>
                    <span className="font-medium">{Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)}%</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Stats */}
              <div className="hidden lg:flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Progresso:</span>
                  <span className="font-semibold text-foreground">{Math.round(progressPercentage)}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-success" />
                  <span className="text-muted-foreground">Acurácia:</span>
                  <span className="font-semibold text-foreground">{Math.round(accuracyPercentage)}%</span>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <ThemeToggle 
                  size="sm"
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground h-9 w-9 rounded-lg"
                />
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={cn(
                    "text-muted-foreground hover:text-foreground h-9 px-3 rounded-lg",
                    showTimer && "bg-primary/10 text-primary"
                  )}
                  onClick={handleTimerToggle}
                >
                  <Clock className="w-4 h-4 mr-1" />
                  Timer
                </Button>
                
                {!showResult && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleSkipQuestion}
                    disabled={submitting || currentQuestionIndex + 1 >= totalQuestions}
                    className="text-muted-foreground hover:text-foreground h-9 px-3 rounded-lg"
                  >
                    <SkipForward className="w-4 h-4 mr-1" />
                    Pular
                  </Button>
                )}
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate(`/resultados/${listId}`)}
                  className="text-muted-foreground hover:text-foreground h-9 px-3 rounded-lg"
                  title="Ver resultados (R)"
                >
                  <BarChart3 className="w-4 h-4 mr-1" />
                  Resultados
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 py-6">
        <div className="flex flex-col xl:flex-row gap-6">
          {/* Question Content */}
          <main className="flex-1 min-w-0">
            <QuestionContent
              currentQuestion={currentQuestion}
              selectedAnswerId={selectedAnswerId}
              showResult={showResult}
              submitting={submitting}
              errorReason={errorReason}
              handleAnswerSelect={handleAnswerSelect}
              motivoErroOptions={motivoErroOptions}
              setErrorReason={setErrorReason}
              isCurrentQuestionAnsweredCorrectly={isCurrentQuestionAnsweredCorrectly}
              respostaListaItem={respostasLista[currentQuestionIndex]}
              onAfterMotivoErroUpdate={fetchRespostasLista}
            />
          </main>

          {/* Sidebar */}
          <aside className="xl:w-72 flex-shrink-0 space-y-4">
            {/* Timer */}
            {showTimer && (
              <div className="sticky top-28">
                <QuestionTimer onTimeUp={handleTimeUp} />
              </div>
            )}
            
            {/* Response Card */}
            <div className="sticky top-28">
              <ResponseCard
                respostasLista={respostasLista}
                currentQuestionIndex={currentQuestionIndex}
                handleNavigateToQuestion={(idx) => handleNavigate(idx, false)}
                onViewResults={() => navigate(`/resultados/${listId}`)}
              />
            </div>
          </aside>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="sticky bottom-0 z-40 bg-background/95 backdrop-blur border-t border-border/40">
        <div className="px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={() => handleNavigate(currentQuestionIndex - 1)}
                disabled={currentQuestionIndex === 0}
                className="hidden sm:flex h-9 rounded-lg"
              >
                ← Anterior
              </Button>
              
              {/* Botão de Pular para Mobile */}
              {!showResult && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={handleSkipQuestion}
                  disabled={submitting || currentQuestionIndex + 1 >= totalQuestions}
                  className="sm:hidden h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground"
                  title="Pular questão"
                >
                  <SkipForward className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {!showResult ? (
                <Button 
                  onClick={handleSubmit}
                  disabled={submitting || selectedAnswerId === null}
                  className="h-9 rounded-lg"
                >
                  {submitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin mr-2" />Enviando...</>
                  ) : (
                    'Confirmar Resposta'
                  )}
                </Button>
              ) : (
                <Button 
                  onClick={() => handleNavigate(currentQuestionIndex + 1)}
                  disabled={currentQuestionIndex >= totalQuestions - 1}
                  className="h-9 rounded-lg"
                >
                  {currentQuestionIndex >= totalQuestions - 1 ? 'Finalizada' : 'Próxima →'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnswerQuestionPage;
