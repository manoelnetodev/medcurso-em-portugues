import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import {
  TopBar,
  QuestionNavigator,
  QuestionContent,
  ResponseCard,
} from '@/components/answer-question';

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
  const [errorReason, setErrorReason] = useState<Tables<'public', 'Enums', 'motivo_erro'> | null>(null);

  const currentQuestion = respostasLista[currentQuestionIndex]?.questoes || null;

  const fetchListData = useCallback(async () => {
    if (!listId || !user) return;
    setLoading(true);
    try {
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

  const handleNavigate = (newIndex: number) => {
    if (newIndex >= 0 && newIndex < respostasLista.length) {
      setCurrentQuestionIndex(newIndex);
    } else if (newIndex >= respostasLista.length) {
      toast({ title: "Fim da Lista", description: "Você respondeu todas as questões!" });
      navigate('/listas');
    }
  };

  const motivoErroOptions = [
    { label: 'Falta de Conhecimento (FC)', value: 'FC' },
    { label: 'Falta de Atenção (FA)', value: 'FA' },
    { label: 'Falta de Revisão (FR)', value: 'FR' },
    { label: 'Confusão de Alternativas (CA)', value: 'CA' },
  ];

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
        Não foi possível carregar a questão. Tente novamente.
      </div>
    );
  }

  const totalQuestions = respostasLista.length;
  const isCurrentQuestionAnsweredCorrectly = respostasLista[currentQuestionIndex]?.acertou || false;

  return (
    <div className="flex flex-col lg:flex-row">
      <main className="flex-1 flex flex-col">
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
          <TopBar
            title={currentQuestion.instituicao || 'Prova'}
            questionCount={totalQuestions}
          />
          <QuestionNavigator
            current={currentQuestionIndex + 1}
            total={totalQuestions}
            onPrevious={() => handleNavigate(currentQuestionIndex - 1)}
            onNext={() => handleNavigate(currentQuestionIndex + 1)}
            isPreviousDisabled={currentQuestionIndex === 0}
            isNextDisabled={false}
          />
        </div>

        <div className="flex-1 p-6">
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
          />
        </div>
        
        <div className="sticky bottom-0 p-4 bg-background/80 backdrop-blur-sm border-t border-border">
          {showResult ? (
            <Button onClick={() => handleNavigate(currentQuestionIndex + 1)} className="w-full md:w-auto min-w-[200px]">
              Próxima Questão
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={selectedAnswerId === null || submitting} className="w-full md:w-auto min-w-[200px]">
              {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Respondendo...</> : 'Responder'}
            </Button>
          )}
        </div>
      </main>

      <aside className="w-full lg:max-w-sm border-t lg:border-t-0 border-border p-4">
        <ResponseCard
          respostasLista={respostasLista}
          currentQuestionIndex={currentQuestionIndex}
          handleNavigateToQuestion={handleNavigate}
        />
      </aside>
    </div>
  );
};

export default AnswerQuestionPage;
