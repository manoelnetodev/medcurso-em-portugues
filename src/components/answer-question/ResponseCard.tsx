import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';
import { RespostaListaWithQuestion } from '@/pages/AnswerQuestionPage';
import { ResponseCardLegend } from './ResponseCardLegend';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, MinusCircle, Clock, Target, BarChart3 } from 'lucide-react';

interface ResponseCardProps {
  respostasLista: RespostaListaWithQuestion[];
  currentQuestionIndex: number;
  handleNavigateToQuestion: (index: number) => void;
  onViewResults?: () => void;
}

export const ResponseCard: React.FC<ResponseCardProps> = ({
  respostasLista,
  currentQuestionIndex,
  handleNavigateToQuestion,
  onViewResults,
}) => {
  const answeredQuestions = respostasLista.filter(r => r.respondeu).length;
  const correctAnswers = respostasLista.filter(r => r.acertou).length;
  const progressPercentage = respostasLista.length > 0 ? (answeredQuestions / respostasLista.length) * 100 : 0;
  const accuracyPercentage = answeredQuestions > 0 ? (correctAnswers / answeredQuestions) * 100 : 0;

  return (
    <Card className="h-full flex flex-col bg-card/80 backdrop-blur-sm border-0 shadow-xl rounded-xl">
      <CardHeader className="pb-3 p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-primary/10 rounded-lg">
                <Target className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-sm font-bold text-foreground">Cartão Resposta</CardTitle>
            </div>
            {onViewResults && (
              <div className="relative text-[10px] text-success bg-gradient-to-r from-success/20 to-primary/10 px-1.5 py-0.5 rounded-lg border border-success/30 animate-pulse shadow-md">
                <span className="font-mono font-bold">Tecla R</span>
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-success rounded-full animate-ping"></div>
              </div>
            )}
          </div>
          
          {/* Progress Stats */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium">Progresso</span>
              <span className="font-bold text-foreground">{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full h-1.5 bg-muted rounded-lg overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-500 ease-out rounded-lg"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium">Acurácia</span>
              <span className="font-bold text-success">{Math.round(accuracyPercentage)}%</span>
            </div>
            <div className="w-full h-1.5 bg-muted rounded-lg overflow-hidden">
              <div 
                className="h-full bg-success transition-all duration-500 ease-out rounded-lg"
                style={{ width: `${accuracyPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </CardHeader>
      
      <ResponseCardLegend />
      
      <CardContent className="flex-1 p-3">
        <div className="space-y-3">
          {/* Question Grid */}
          <div className="grid grid-cols-5 gap-1.5">
            {respostasLista.map((resposta, index) => {
              const isCurrent = index === currentQuestionIndex;
              const isAnswered = resposta.respondeu;
              const isCorrect = resposta.acertou;
              const isAnnulled = resposta.questoes?.anulada;

              return (
                <Button
                  key={resposta.id}
                  variant="outline"
                  size="icon"
                  className={cn(
                    "w-8 h-8 rounded-lg text-xs font-bold transition-all duration-200 relative group p-0 border-2",
                    isAnswered && isCorrect && !isAnnulled && "bg-success/20 border-success/40 text-success hover:bg-success/30 shadow-md shadow-success/10",
                    isAnswered && !isCorrect && !isAnnulled && "bg-destructive/20 border-destructive/40 text-destructive hover:bg-destructive/30 shadow-md shadow-destructive/10",
                    isAnnulled && "bg-yellow-500/20 border-yellow-500/40 text-yellow-600 hover:bg-yellow-500/30 shadow-md shadow-yellow-500/10",
                    !isAnswered && "bg-muted/30 hover:bg-muted/50 border-muted/50 text-muted-foreground",
                    isCurrent && "ring-2 ring-primary ring-offset-1 ring-offset-background shadow-lg scale-105"
                  )}
                  onClick={() => handleNavigateToQuestion(index)}
                >
                  {index + 1}
                  
                  {/* Status indicator dot */}
                  {isAnswered && (
                    <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-lg flex items-center justify-center">
                      {isCorrect ? (
                        <div className="w-2 h-2 bg-success rounded-lg" />
                      ) : isAnnulled ? (
                        <div className="w-2 h-2 bg-yellow-500 rounded-lg" />
                      ) : (
                        <div className="w-2 h-2 bg-destructive rounded-lg" />
                      )}
                    </div>
                  )}
                  
                  {/* Hover effect */}
                  <div className="absolute inset-0 rounded-lg bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </Button>
              );
            })}
          </div>
          
          {/* Summary Stats */}
          <div className="pt-2 border-t border-border/30">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-muted/30 rounded-lg p-2.5 text-center border border-muted/20">
                <div className="text-sm font-bold text-foreground">{answeredQuestions}</div>
                <div className="text-xs text-muted-foreground">Respondidas</div>
              </div>
              <div className="bg-muted/30 rounded-lg p-2.5 text-center border border-muted/20">
                <div className="text-sm font-bold text-success">{correctAnswers}</div>
                <div className="text-xs text-muted-foreground">Corretas</div>
              </div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="pt-2 border-t border-border/30">
            <div className="space-y-1.5">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start text-xs text-muted-foreground hover:text-foreground h-8 bg-muted/20 hover:bg-muted/40 border-muted/30 rounded-lg"
                onClick={() => {
                  const firstUnanswered = respostasLista.findIndex(r => !r.respondeu);
                  if (firstUnanswered !== -1) {
                    handleNavigateToQuestion(firstUnanswered);
                  }
                }}
              >
                <Clock className="w-3 h-3 mr-1.5" />
                Próxima não respondida
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start text-xs text-muted-foreground hover:text-foreground h-8 bg-muted/20 hover:bg-muted/40 border-muted/30 rounded-lg"
                onClick={() => {
                  const firstIncorrect = respostasLista.findIndex(r => r.respondeu && !r.acertou);
                  if (firstIncorrect !== -1) {
                    handleNavigateToQuestion(firstIncorrect);
                  }
                }}
              >
                <XCircle className="w-3 h-3 mr-1.5" />
                Próxima incorreta
              </Button>
              
              {/* Botão Ver Resultados */}
              {onViewResults && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start text-xs text-foreground hover:text-foreground h-8 bg-gradient-to-r from-success/20 to-primary/10 hover:from-success/30 hover:to-primary/20 border-success/40 rounded-lg animate-pulse hover:animate-none animate-glow-pulse animate-subtle-scale relative overflow-hidden"
                  onClick={onViewResults}
                  title="Atalho: Tecla R"
                >
                  {/* Efeito shimmer */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
                  <BarChart3 className="w-3 h-3 mr-1.5 animate-pulse relative z-10" />
                  <span className="relative z-10 font-semibold">Ver Resultados</span>
                  <div className="ml-auto relative z-10">
                    <span className="text-[10px] bg-success/30 text-success px-1 py-0.5 rounded-sm font-mono animate-bounce">R</span>
                  </div>
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
