import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from '@/integrations/supabase/client';
import { QuestionDetails } from '@/pages/AnswerQuestionPage';
import { Tables } from '@/integrations/supabase/types';
import { AlternativeItem } from './AlternativeItem';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, Lightbulb, TrendingUp, Users, Clock, Book, Zap, RefreshCw, Shuffle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

interface QuestionContentProps {
  currentQuestion: QuestionDetails;
  selectedAnswerId: number | null;
  showResult: boolean;
  submitting: boolean;
  errorReason: Tables<'resposta_lista'>['motivo_erro'] | null;
  handleAnswerSelect: (answerId: number) => void;
  motivoErroOptions: { label: string; value: Tables<'resposta_lista'>['motivo_erro'] }[];
  setErrorReason: (reason: Tables<'resposta_lista'>['motivo_erro'] | null) => void;
  isCurrentQuestionAnsweredCorrectly: boolean;
  respostaListaItem: any; // adicionar prop para acessar estudou e id
  onAfterMotivoErroUpdate?: () => void;
}

export const QuestionContent: React.FC<QuestionContentProps> = ({
  currentQuestion,
  selectedAnswerId,
  showResult,
  submitting,
  errorReason,
  handleAnswerSelect,
  motivoErroOptions,
  setErrorReason,
  isCurrentQuestionAnsweredCorrectly,
  respostaListaItem,
  onAfterMotivoErroUpdate,
}) => {
  const [provaNome, setProvaNome] = useState<string>('');
  const [categoriaNome, setCategoriaNome] = useState<string>('');
  const [subcategoriaNome, setSubcategoriaNome] = useState<string>('');
  const [assuntoNome, setAssuntoNome] = useState<string>('');
  const [isEstudou, setIsEstudou] = useState<boolean>(!!respostaListaItem?.estudou);
  const [estudouLoading, setEstudouLoading] = useState(false);
  // Estado local para o motivo do erro
  const [errorReasonLocal, setErrorReasonLocal] = useState<Tables<'resposta_lista'>['motivo_erro'] | null>(respostaListaItem?.motivo_erro || null);

  useEffect(() => {
    const fetchProvaNome = async () => {
      if (!currentQuestion?.prova) return;
      const { data, error } = await supabase
        .from('provas')
        .select('nome')
        .eq('id', currentQuestion.prova)
        .single();
      if (!error && data?.nome) {
        setProvaNome(data.nome);
      } else {
        setProvaNome('');
      }
    };
    fetchProvaNome();
  }, [currentQuestion?.prova]);

  useEffect(() => {
    const fetchTags = async () => {
      if (currentQuestion?.categoria) {
        const { data } = await supabase
          .from('categoria')
          .select('nome')
          .eq('id', currentQuestion.categoria)
          .single();
        setCategoriaNome(data?.nome || '');
      } else {
        setCategoriaNome('');
      }
      if (currentQuestion?.subcategoria) {
        const { data } = await supabase
          .from('subcategoria')
          .select('nome')
          .eq('id', currentQuestion.subcategoria)
          .single();
        setSubcategoriaNome(data?.nome || '');
      } else {
        setSubcategoriaNome('');
      }
      if (currentQuestion?.assunto) {
        const { data } = await supabase
          .from('assunto')
          .select('nome')
          .eq('id', currentQuestion.assunto)
          .single();
        setAssuntoNome(data?.nome || '');
      } else {
        setAssuntoNome('');
      }
    };
    fetchTags();
  }, [currentQuestion?.categoria, currentQuestion?.subcategoria, currentQuestion?.assunto]);

  useEffect(() => {
    setIsEstudou(!!respostaListaItem?.estudou);
    setErrorReasonLocal(respostaListaItem?.motivo_erro || null);
  }, [respostaListaItem?.id]);

  const handleToggleEstudou = async (checked: boolean) => {
    setEstudouLoading(true);
    setIsEstudou(checked);
    try {
      await supabase
        .from('resposta_lista')
        .update({ estudou: checked })
        .eq('id', respostaListaItem?.id);
    } finally {
      setEstudouLoading(false);
    }
  };

  const handleMotivoErroChange = async (value: Tables<'resposta_lista'>['motivo_erro']) => {
    // Garantir que só FC, FA, FR, CA sejam salvos
    const validMotivos: Tables<'resposta_lista'>['motivo_erro'][] = ['FC', 'FA', 'FR', 'CA'];
    let motivo: Tables<'resposta_lista'>['motivo_erro'] = value;
    if (!validMotivos.includes(value)) {
      const found = validMotivos.find(m => (value as string).includes(m));
      if (found) motivo = found;
    }
    if (respostaListaItem?.id && validMotivos.includes(motivo)) {
      const { error } = await supabase
        .from('resposta_lista')
        .update({ motivo_erro: motivo })
        .eq('id', respostaListaItem.id);
      if (!error) {
        setErrorReasonLocal(motivo);
        toast({ title: 'Motivo do erro salvo!', variant: 'default' });
        if (onAfterMotivoErroUpdate) onAfterMotivoErroUpdate();
      }
    } else {
      setErrorReasonLocal(motivo);
    }
  };

  return (
    <div className="space-y-4">
      {/* Tags de categoria, subcategoria e assunto */}
      <div className="flex flex-wrap gap-1 mb-2">
        {categoriaNome && (
          <Badge variant="secondary" className="bg-blue-900/10 text-blue-900 border-blue-900/20 font-semibold text-[11px] px-2 py-0.5 rounded-lg">
            {categoriaNome}
          </Badge>
        )}
        {subcategoriaNome && (
          <Badge variant="secondary" className="bg-purple-900/10 text-purple-900 border-purple-900/20 font-semibold text-[11px] px-2 py-0.5 rounded-lg">
            {subcategoriaNome}
          </Badge>
        )}
        {assuntoNome && (
          <Badge variant="secondary" className="bg-green-900/10 text-green-900 border-green-900/20 font-semibold text-[11px] px-2 py-0.5 rounded-lg">
            {assuntoNome}
          </Badge>
        )}
      </div>

      {/* Question Statement */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50 backdrop-blur-sm rounded-xl">
        <CardContent className="p-4">
          {/* Linha com número da questão e prova dentro do card */}
          {currentQuestion.numero && provaNome && (
            <div className="mb-3">
              <span className="inline-block text-xs font-bold text-violet-500 bg-violet-500/10 px-2.5 py-1 rounded-xl tracking-tight">
                {currentQuestion.numero} - {provaNome}
              </span>
            </div>
          )}
          <div className="prose prose-invert max-w-none">
            <div className="text-foreground/90 text-sm sm:text-base font-medium leading-relaxed bg-muted/30 rounded-xl p-4 border border-muted/40 shadow-sm">
              <p className="m-0">{currentQuestion.enunciado}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alternatives Section */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50 backdrop-blur-sm rounded-xl">
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
              <h3 className="text-base font-semibold text-foreground">Alternativas</h3>
              <span className="text-xs text-muted-foreground">Selecione a resposta correta:</span>
            </div>
            
            <div className="space-y-3">
              {currentQuestion.alternativas.map((alt, index) => (
                <AlternativeItem
                  key={alt.id}
                  alternative={alt}
                  index={index}
                  selectedAnswerId={selectedAnswerId}
                  showResult={showResult}
                  isSubmitting={submitting}
                  onSelect={handleAnswerSelect}
                  isQuestionAnnulled={currentQuestion.anulada}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Result Section */}
      {showResult && (
        <div className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
          {/* Result Banner */}
          <Card className={`border-0 shadow-lg overflow-hidden rounded-xl ${
            (isCurrentQuestionAnsweredCorrectly || currentQuestion.anulada)
              ? 'bg-gradient-to-r from-success/10 to-success/5 border-success/20' 
              : 'bg-gradient-to-r from-destructive/10 to-destructive/5 border-destructive/20'
          }`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  (isCurrentQuestionAnsweredCorrectly || currentQuestion.anulada)
                    ? 'bg-success/20 text-success' 
                    : 'bg-destructive/20 text-destructive'
                }`}>
                  {(isCurrentQuestionAnsweredCorrectly || currentQuestion.anulada) ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <XCircle className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <h3 className={`text-base font-bold ${
                    (isCurrentQuestionAnsweredCorrectly || currentQuestion.anulada) ? 'text-success' : 'text-destructive'
                  }`}>
                    {currentQuestion.anulada ? 'Questão Anulada!' : (isCurrentQuestionAnsweredCorrectly ? 'Resposta Correta!' : 'Resposta Incorreta')}
                  </h3>
                  <p className="text-muted-foreground text-xs">
                    {currentQuestion.anulada 
                      ? 'Esta questão foi anulada. Todas as alternativas estão corretas.' 
                      : (isCurrentQuestionAnsweredCorrectly 
                        ? 'Parabéns! Você acertou esta questão.' 
                        : 'Não se preocupe, continue estudando!')
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Explanation */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50 backdrop-blur-sm rounded-xl">
            <CardContent className="p-4">
              <div className="space-y-3">
                              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  <Lightbulb className="h-4 w-4 text-primary" />
                </div>
                <h4 className="text-base font-semibold text-foreground">Explicação</h4>
              </div>
              
              <div className="prose prose-invert prose-sm max-w-none">
                <div className="bg-muted/40 rounded-lg p-4 border border-muted/30">
                  <p className="text-foreground/90 leading-relaxed m-0 text-sm">
                    {currentQuestion.comentario || "Nenhuma explicação disponível para esta questão."}
                  </p>
                </div>
              </div>
              </div>
            </CardContent>
          </Card>

          {/* Error Classification */}
          {!isCurrentQuestionAnsweredCorrectly && !currentQuestion.anulada && (
            <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50 backdrop-blur-sm rounded-xl">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-destructive/10 text-destructive text-base font-bold">
                      ❌
                    </span>
                    <span className="text-sm font-semibold text-foreground">Classificar Erro</span>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Ajude-nos a melhorar seus estudos classificando o motivo do erro:
                  </p>
                  {/* Seletor visual de motivo do erro */}
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Falta de Conhecimento', value: 'FC', color: 'bg-blue-600 border-blue-500', icon: <Book className="w-5 h-5" /> },
                      { label: 'Falta de Atenção', value: 'FA', color: 'bg-yellow-500 border-yellow-400', icon: <Zap className="w-5 h-5" /> },
                      { label: 'Falta de Revisão', value: 'FR', color: 'bg-purple-600 border-purple-500', icon: <RefreshCw className="w-5 h-5" /> },
                      { label: 'Confusão de Alternativas', value: 'CA', color: 'bg-pink-600 border-pink-500', icon: <Shuffle className="w-5 h-5" /> },
                    ].map(option => {
                      const selected = errorReasonLocal === option.value;
                      return (
                        <Button
                          key={option.value}
                          type="button"
                          variant="ghost"
                          className={`flex flex-col items-center justify-center h-16 rounded-lg border-2 transition-all duration-200 px-2
                            ${selected ? option.color + ' text-white border-2' : 'bg-card border-border text-white hover:bg-muted/60'}
                            ${selected ? '' : 'hover:border-primary/40'}
                          `}
                          onClick={() => handleMotivoErroChange(option.value as any)}
                          disabled={submitting}
                        >
                          <div className="flex flex-col items-center justify-center gap-1">
                            <span>{option.icon}</span>
                            <span className="text-xs font-semibold text-center leading-tight">{option.label}</span>
                            <span className="text-xs font-bold">{option.value}</span>
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Checkbox Estudou - novo design */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50 backdrop-blur-sm rounded-xl">
            <CardContent className="p-3">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-primary/10 text-primary text-base font-bold">
                    📚
                  </span>
                  <span className="text-sm font-semibold text-foreground">Você estudou esse tema?</span>
                </div>
                <div className="flex gap-3 justify-center">
                  <Button
                    type="button"
                    variant={isEstudou ? "default" : "outline"}
                    className={`flex flex-col items-center justify-center w-14 h-14 rounded-lg border-2 ${isEstudou ? 'border-green-600 bg-green-600/20 text-green-700' : 'border-border'}`}
                    onClick={() => handleToggleEstudou(true)}
                    disabled={estudouLoading}
                  >
                    <CheckCircle className="w-6 h-6 mb-0.5" />
                    <span className="text-xs font-medium">Sim</span>
                  </Button>
                  <Button
                    type="button"
                    variant={!isEstudou ? "default" : "outline"}
                    className={`flex flex-col items-center justify-center w-14 h-14 rounded-lg border-2 ${!isEstudou ? 'border-destructive bg-destructive/20 text-destructive' : 'border-border'}`}
                    onClick={() => handleToggleEstudou(false)}
                    disabled={estudouLoading}
                  >
                    <XCircle className="w-6 h-6 mb-0.5" />
                    <span className="text-xs font-medium">Não</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50 backdrop-blur-sm rounded-xl">
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-primary/10 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                  <h4 className="text-base font-semibold text-foreground">Estatísticas da Questão</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-muted/40 rounded-lg p-4 text-center border border-muted/30">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Users className="h-3 w-3 text-primary" />
                      <span className="text-xs text-muted-foreground font-medium">Taxa de Acerto</span>
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                      {currentQuestion.percentual_acertos || 0}%
                    </div>
                  </div>
                  
                  <div className="bg-muted/40 rounded-lg p-4 text-center border border-muted/30">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <TrendingUp className="h-3 w-3 text-success" />
                      <span className="text-xs text-muted-foreground font-medium">Seu Histórico</span>
                    </div>
                    <div className="text-2xl font-bold text-success">N/A</div>
                  </div>
                  
                  <div className="bg-muted/40 rounded-lg p-4 text-center border border-muted/30">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground font-medium">Total Respostas</span>
                    </div>
                    <div className="text-2xl font-bold text-foreground">N/A</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
