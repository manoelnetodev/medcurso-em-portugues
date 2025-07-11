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
import { CheckCircle, XCircle, Lightbulb, TrendingUp, Users, Clock, Book, Zap, RefreshCw, Shuffle, MessageSquareText, Target, Trophy, AlertTriangle, Search, Smile, Meh, Frown, HelpCircle, Code, Shield, ChevronDown, ChevronUp, List } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { RichTextRenderer } from '@/components/ui/rich-text-renderer';
import { cn } from '@/lib/utils';

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
  // Estado para controlar se a explicação está expandida
  const [isExplanationExpanded, setIsExplanationExpanded] = useState(true);
  // Estado para controlar se a explicação por alternativa está expandida
  const [isAlternativeExplanationExpanded, setIsAlternativeExplanationExpanded] = useState(false);

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

  // Função para mapear a dificuldade
  const getDifficultyInfo = (dif_q: string | null) => {
    switch (dif_q) {
      case 'f':
        return { 
          label: 'Fácil', 
          color: 'text-green-600', 
          bgColor: 'bg-green-500/15', 
          borderColor: 'border-green-500/30',
          icon: Smile
        };
      case 'm':
        return { 
          label: 'Médio', 
          color: 'text-amber-600', 
          bgColor: 'bg-amber-500/15', 
          borderColor: 'border-amber-500/30',
          icon: Meh
        };
      case 'd':
        return { 
          label: 'Difícil', 
          color: 'text-red-600', 
          bgColor: 'bg-red-500/15', 
          borderColor: 'border-red-500/30',
          icon: Frown
        };
      case 'sem_base':
        return { 
          label: 'Sem Base', 
          color: 'text-slate-600', 
          bgColor: 'bg-slate-500/15', 
          borderColor: 'border-slate-500/30',
          icon: HelpCircle
        };
      default:
        return { 
          label: 'Não definida', 
          color: 'text-slate-600', 
          bgColor: 'bg-slate-500/15', 
          borderColor: 'border-slate-500/30',
          icon: HelpCircle
        };
    }
  };

  const difficultyInfo = getDifficultyInfo(currentQuestion.dif_q as string | null);
  const isSemBase = String(currentQuestion.dif_q) === 'sem_base';
  const DifficultyIcon = difficultyInfo.icon;

  return (
    <div className="space-y-3">
      {/* Tags de categoria, subcategoria e assunto */}
      <div className="flex flex-wrap gap-2 mb-2">
        {categoriaNome && (
          <Badge variant="secondary" className="bg-blue-600/20 text-blue-800 dark:text-blue-200 border-blue-600/40 font-bold text-xs px-3 py-1 rounded-lg shadow-sm hover:bg-blue-600/25 transition-colors">
            {categoriaNome}
          </Badge>
        )}
        {subcategoriaNome && (
          <Badge variant="secondary" className="bg-purple-600/20 text-purple-800 dark:text-purple-200 border-purple-600/40 font-bold text-xs px-3 py-1 rounded-lg shadow-sm hover:bg-purple-600/25 transition-colors">
            {subcategoriaNome}
          </Badge>
        )}
        {assuntoNome && (
          <Badge variant="secondary" className="bg-emerald-600/20 text-emerald-800 dark:text-emerald-200 border-emerald-600/40 font-bold text-xs px-3 py-1 rounded-lg shadow-sm hover:bg-emerald-600/25 transition-colors">
            {assuntoNome}
          </Badge>
        )}
      </div>

      {/* Question Statement - Modernizado */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-card via-card/95 to-background/10 backdrop-blur-md rounded-2xl group hover:shadow-primary/5 transition-all duration-300">
        <CardContent className="p-4">
          {/* Header com número da questão */}
          {currentQuestion.numero && provaNome && (
            <div className="mb-4">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-violet-500 bg-gradient-to-r from-violet-500/12 to-violet-500/6 px-3 py-1.5 rounded-xl border border-violet-500/20 shadow-sm">
                <div className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-pulse"></div>
                <span className="tracking-tight">{currentQuestion.numero} - {provaNome}</span>
              </div>
            </div>
          )}
          
          {/* Enunciado com design moderno */}
          <div className="relative group/question">
            <div className="absolute inset-0 bg-gradient-to-br from-muted/20 via-muted/10 to-transparent rounded-xl blur-sm opacity-50 group-hover/question:opacity-70 transition-opacity duration-300"></div>
            <div className="relative bg-gradient-to-br from-background/40 via-background/30 to-background/20 backdrop-blur-sm rounded-xl p-4 border border-muted/25 shadow-sm hover:border-muted/35 transition-all duration-300">
              <div className="text-foreground/95 text-sm leading-relaxed">
                <p className="m-0">{currentQuestion.enunciado}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alternatives Section - Modernizada */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-card via-card/95 to-background/10 backdrop-blur-md rounded-2xl group hover:shadow-primary/5 transition-all duration-300">
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Header das alternativas */}
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Alternativas</h3>
                <span className="text-xs text-muted-foreground">Selecione a resposta correta:</span>
              </div>
            </div>
            
            {/* Lista de alternativas */}
            <div className="space-y-2.5">
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
        <div className="space-y-3 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
          {/* Result Banner - Simplificado */}
          <Card className={`border rounded-lg ${
            (isCurrentQuestionAnsweredCorrectly || currentQuestion.anulada)
              ? 'bg-success/5 border-success/20' 
              : 'bg-destructive/5 border-destructive/20'
          }`}>
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-lg ${
                  (isCurrentQuestionAnsweredCorrectly || currentQuestion.anulada)
                    ? 'bg-success/10 text-success' 
                    : 'bg-destructive/10 text-destructive'
                }`}>
                  {(isCurrentQuestionAnsweredCorrectly || currentQuestion.anulada) ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className={`font-bold text-sm ${
                    (isCurrentQuestionAnsweredCorrectly || currentQuestion.anulada) ? 'text-success' : 'text-destructive'
                  }`}>
                    {currentQuestion.anulada ? 'Questão Anulada' : (isCurrentQuestionAnsweredCorrectly ? 'Resposta Correta' : 'Resposta Incorreta')}
                  </h3>
                </div>
                
                <Badge variant="outline" className={`text-xs ${
                  (isCurrentQuestionAnsweredCorrectly || currentQuestion.anulada)
                    ? 'border-success/25 text-success' 
                    : 'border-destructive/25 text-destructive'
                }`}>
                  {currentQuestion.anulada ? 'Anulada' : (isCurrentQuestionAnsweredCorrectly ? 'Acertou' : 'Errou')}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Explanation - Simplificada */}
          <Card className="border rounded-lg">
            <CardContent className="p-0">
              {/* Header com Toggle */}
              <div 
                className={cn(
                  "p-3 cursor-pointer hover:bg-muted/5 transition-colors",
                  isExplanationExpanded ? "border-b" : ""
                )}
                onClick={() => setIsExplanationExpanded(!isExplanationExpanded)}
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-primary/10 rounded-lg">
                    <Lightbulb className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm">Explicação</h4>
                    <p className="text-xs text-muted-foreground">
                      {isExplanationExpanded ? "Raciocínio da resposta" : "Clique para ver explicação"}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs border-success/25 text-success">
                      Validado
                    </Badge>
                    
                    {isExplanationExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </div>
              
              {/* Content */}
              {isExplanationExpanded && (
                <div className="p-3 animate-in slide-in-from-top-2 fade-in-0 duration-200">
                  <div className="bg-muted/5 rounded-lg p-3 border">
                    <RichTextRenderer 
                      content={currentQuestion.comentario || ""} 
                      className="text-sm leading-relaxed"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Explicação por Alternativa */}
          {showResult && (
            <Card className="border rounded-lg">
              <CardContent className="p-0">
                {/* Header com Toggle */}
                <div 
                  className={cn(
                    "p-3 cursor-pointer hover:bg-muted/5 transition-colors",
                    isAlternativeExplanationExpanded ? "border-b" : ""
                  )}
                  onClick={() => setIsAlternativeExplanationExpanded(!isAlternativeExplanationExpanded)}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-primary/10 rounded-lg">
                      <List className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-sm">Explicação por Alternativa</h4>
                      <p className="text-xs text-muted-foreground">
                        {isAlternativeExplanationExpanded ? "Análise detalhada de cada opção" : "Clique para ver explicações individuais"}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {currentQuestion.alternativas.filter(alt => alt.comentario).length} de {currentQuestion.alternativas.length}
                      </Badge>
                      
                      {isAlternativeExplanationExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Content */}
                {isAlternativeExplanationExpanded && (
                  <div className="p-3 animate-in slide-in-from-top-2 fade-in-0 duration-200">
                    <div className="space-y-3">
                      {currentQuestion.alternativas.map((alternative, index) => {
                        const letter = String.fromCharCode(65 + index);
                        const hasComment = alternative.comentario && alternative.comentario.trim() !== '';
                        
                        return (
                          <div key={alternative.id} className="border rounded-lg overflow-hidden">
                            {/* Header da alternativa */}
                            <div className={cn(
                              "flex items-start gap-3 p-3",
                              alternative.correta 
                                ? "bg-success/5 border-b border-success/20" 
                                : "bg-muted/3 border-b"
                            )}>
                              <div className={cn(
                                "w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold",
                                alternative.correta 
                                  ? "bg-success/15 text-success border border-success/30"
                                  : "bg-muted text-muted-foreground"
                              )}>
                                {letter}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground">
                                  {alternative.alternativa_txt}
                                </p>
                              </div>
                              {alternative.correta && (
                                <Badge variant="outline" className="text-xs border-success/25 text-success bg-success/5">
                                  Correta
                                </Badge>
                              )}
                            </div>
                            
                            {/* Explicação da alternativa */}
                            {hasComment && (
                              <div className="p-3 bg-muted/3">
                                <RichTextRenderer 
                                  content={alternative.comentario || ""} 
                                  className="text-sm text-muted-foreground leading-relaxed"
                                />
                              </div>
                            )}
                            
                            {/* Placeholder se não tiver comentário */}
                            {!hasComment && (
                              <div className="p-3 bg-muted/3">
                                <p className="text-xs text-muted-foreground italic flex items-center gap-1">
                                  <MessageSquareText className="h-3 w-3" />
                                  Explicação não disponível para esta alternativa
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Seções agrupadas: Classificar Erro + Você estudou */}
          {showResult && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {/* Você estudou esse tema? */}
              <Card className="border rounded-lg">
                <CardContent className="p-3">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Book className="h-4 w-4 text-primary" />
                      <h4 className="font-bold text-sm">Você estudou esse tema?</h4>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={isEstudou ? "default" : "outline"}
                        size="sm"
                        className="flex-1"
                        onClick={() => handleToggleEstudou(true)}
                        disabled={estudouLoading}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Sim
                      </Button>
                      
                      <Button
                        type="button"
                        variant={!isEstudou ? "destructive" : "outline"}
                        size="sm"
                        className="flex-1"
                        onClick={() => handleToggleEstudou(false)}
                        disabled={estudouLoading}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Não
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Motivo do Erro */}
              {!isCurrentQuestionAnsweredCorrectly && !currentQuestion.anulada && (
                <Card className="border rounded-lg">
                  <CardContent className="p-3">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-destructive" />
                        <h4 className="font-bold text-sm">Classificar Erro</h4>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        {motivoErroOptions.map((option) => (
                          <Button
                            key={option.value}
                            type="button"
                            variant={errorReason === option.value ? "destructive" : "outline"}
                            size="sm"
                            className="text-left justify-start"
                            onClick={() => setErrorReason(option.value)}
                          >
                            <div className="text-xs truncate">{option.label}</div>
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Statistics - Simplificadas */}
          <Card className="border rounded-lg">
            <CardContent className="p-3">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <h4 className="font-bold text-sm">Estatísticas</h4>
                </div>
                
                {/* Grid compacto */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-muted/5 border rounded-lg p-2">
                    <div className="text-lg font-bold text-primary">
                      {currentQuestion.percentual_acertos || 0}%
                    </div>
                    <div className="text-xs text-muted-foreground">Taxa de Acerto</div>
                  </div>
                  
                  <div className={`border rounded-lg p-2 ${difficultyInfo.bgColor} ${difficultyInfo.borderColor}`}>
                    <div className={`text-lg font-bold ${difficultyInfo.color} flex items-center gap-1`}>
                      <DifficultyIcon className="h-4 w-4" />
                      {difficultyInfo.label}
                    </div>
                    <div className="text-xs text-muted-foreground">Dificuldade</div>
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
