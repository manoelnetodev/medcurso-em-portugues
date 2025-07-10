import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import {
  QuestionHeader,
  QuestionProgressBar,
  QuestionContent,
  ResponseCard, // QuestionNavigation will be removed
} from '@/components/answer-question'; // Importar os novos componentes

// Tipos para as questões e alternativas (mantidos aqui por serem centrais)
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
  const [currentQuestion, setCurrentQuestion] = useState<QuestionDetails | null>(null);
  const [selectedAnswerId, setSelectedAnswerId] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorReason, setErrorReason] = useState<Tables<'public', 'Enums', 'motivo_erro'> | null>(null);

  const fetchListData = useCallback(async () => {
    if (!listId || !user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data: respostasData, error: respostasError } = await supabase
        .from('resposta_lista')
        .select(`
          id,
          lista,
          questao,
          alternativa_select,
          acertou,
          respondeu,
          motivo_erro,
          numero,
          assunto,
          categoria,
          subcategoria,
          dificuldade,
          discursiva,
          questoes (
            id,
            enunciado,
            anulada,
            alternativa_Correta,
            comentario,
            instituicao,
            ano,
            numero,
            percentual_acertos,
            dif_q,
            categoria,
            subcategoria,
            discursiva,
            alternativas (
              id,
              alternativa_txt,
              correta
            )
          )
        `)
        .eq('lista', parseInt(listId))
        .eq('user_id', user.id)
        .order('numero', { ascending: true });

      if (respostasError) {
        throw new Error(respostasError.message || "Erro ao buscar respostas da lista.");
      }

      if (!respostasData || respostasData.length === 0) {
        toast({
          title: "Erro",
          description: "Lista de questões não encontrada ou vazia.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const formattedRespostas = respostasData.map(resp => ({
        ...resp,
        questoes: resp.questoes ? {
          ...resp.questoes,
          alternativas: resp.questoes.alternativas?.sort((a, b) => a.id - b.id) || []
        } : null
      }));

      setRespostasLista(formattedRespostas as RespostaListaWithQuestion[]);
      setCurrentQuestion(formattedRespostas[currentQuestionIndex]?.questoes || null);
      setSelectedAnswerId(formattedRespostas[currentQuestionIndex]?.alternativa_select || null);
      setShowResult(formattedRespostas[currentQuestionIndex]?.respondeu || false);
      setErrorReason(formattedRespostas[currentQuestionIndex]?.motivo_erro || null);

    } catch (error: any) {
      console.error("Erro ao carregar dados da lista:", error.message);
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [listId, user, toast, currentQuestionIndex]);

  useEffect(() => {
    fetchListData();
  }, [fetchListData]);

  useEffect(() => {
    if (respostasLista.length > 0) {
      const currentResp = respostasLista[currentQuestionIndex];
      setCurrentQuestion(currentResp?.questoes || null);
      setSelectedAnswerId(currentResp?.alternativa_select || null);
      setShowResult(currentResp?.respondeu || false);
      setErrorReason(currentResp?.motivo_erro || null);
    }
  }, [currentQuestionIndex, respostasLista]);

  const handleAnswerSelect = (answerId: number) => {
    if (!showResult) {
      setSelectedAnswerId(answerId);
    }
  };

  const handleSubmit = async () => {
    if (!user || !listId || !currentQuestion || selectedAnswerId === null) {
      toast({
        title: "Aviso",
        description: "Selecione uma alternativa antes de responder.",
        variant: "default",
      });
      return;
    }

    setSubmitting(true);
    try {
      let isCorrect = currentQuestion.alternativa_Correta === selectedAnswerId;
      let finalErrorReason: Tables<'public', 'Enums', 'motivo_erro'> | null = isCorrect ? null : errorReason;

      if (currentQuestion.anulada) {
        isCorrect = true;
        finalErrorReason = 'ANULADA';
      }

      const currentRespostaId = respostasLista[currentQuestionIndex].id;

      const { error } = await supabase
        .from('resposta_lista')
        .update({
          respondeu: true,
          acertou: isCorrect,
          alternativa_select: selectedAnswerId,
          data_resposta: new Date().toISOString(),
          motivo_erro: finalErrorReason,
        })
        .eq('id', currentRespostaId);

      if (error) {
        throw new Error(error.message || "Erro ao salvar sua resposta.");
      }

      setRespostasLista(prev => {
        const newRespostas = [...prev];
        newRespostas[currentQuestionIndex] = {
          ...newRespostas[currentQuestionIndex],
          respondeu: true,
          acertou: isCorrect,
          alternativa_select: selectedAnswerId,
          data_resposta: new Date().toISOString(),
          motivo_erro: finalErrorReason,
        };
        return newRespostas;
      });

      setShowResult(true);
      toast({
        title: isCorrect ? "Resposta Correta!" : "Resposta Incorreta.",
        description: isCorrect ? "Parabéns!" : "Revise a explicação.",
        variant: isCorrect ? "default" : "destructive",
      });

    } catch (error: any) {
      console.error("Erro ao submeter resposta:", error.message);
      toast({
        title: "Erro ao submeter resposta",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < respostasLista.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswerId(null);
      setShowResult(false);
      setErrorReason(null);
    } else {
      toast({
        title: "Fim da Lista",
        description: "Você respondeu todas as questões desta lista!",
      });
      navigate('/listas');
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setSelectedAnswerId(null);
      setShowResult(false);
      setErrorReason(null);
    }
  };

  const handleNavigateToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
    setSelectedAnswerId(null);
    setShowResult(false);
    setErrorReason(null);
  };

  const motivoErroOptions = [
    { label: 'Falta de Conhecimento (FC)', value: 'FC' },
    { label: 'Falta de Atenção (FA)', value: 'FA' },
    { label: 'Falta de Revisão (FR)', value: 'FR' },
    { label: 'Confusão de Alternativas (CA)', value: 'CA' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Não foi possível carregar a questão.
      </div>
    );
  }

  const totalQuestions = respostasLista.length;
  const isCurrentQuestionAnsweredCorrectly = respostasLista[currentQuestionIndex]?.acertou || false;

  return (
    <div className="flex flex-col h-full bg-background">
      <QuestionHeader
        instituicao={currentQuestion.instituicao}
        ano={currentQuestion.ano}
        totalQuestions={totalQuestions}
        currentQuestionIndex={currentQuestionIndex}
        handlePreviousQuestion={handlePreviousQuestion}
        handleNextQuestion={handleNextQuestion}
      />

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-auto">
        <div className="lg:col-span-2 space-y-6">
          <QuestionProgressBar
            currentQuestionIndex={currentQuestionIndex}
            totalQuestions={totalQuestions}
            respostasLista={respostasLista}
          />

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

          {/* QuestionNavigation component removed */}
        </div>

        <ResponseCard
          respostasLista={respostasLista}
          currentQuestionIndex={currentQuestionIndex}
          handleNavigateToQuestion={handleNavigateToQuestion}
        />
      </div>
    </div>
  );
};

export default AnswerQuestionPage;
