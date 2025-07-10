import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';
import { RespostaListaWithQuestion } from '@/pages/AnswerQuestionPage';
import { ResponseCardLegend } from './ResponseCardLegend';

interface ResponseCardProps {
  respostasLista: RespostaListaWithQuestion[];
  currentQuestionIndex: number;
  handleNavigateToQuestion: (index: number) => void;
}

export const ResponseCard: React.FC<ResponseCardProps> = ({
  respostasLista,
  currentQuestionIndex,
  handleNavigateToQuestion,
}) => {
  return (
    <Card className="h-full flex flex-col bg-card/50 border-none shadow-none">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-foreground">Cartão Resposta</CardTitle>
      </CardHeader>
      <ResponseCardLegend />
      <CardContent className="flex-1 p-4">
        <div className="grid grid-cols-5 gap-2">
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
                  "w-10 h-10 rounded-lg text-xs font-bold transition-all",
                  isAnswered && isCorrect && !isAnnulled && "bg-success/80 border-success text-success-foreground hover:bg-success",
                  isAnswered && !isCorrect && !isAnnulled && "bg-destructive/80 border-destructive text-destructive-foreground hover:bg-destructive",
                  isAnnulled && "bg-yellow-500/80 border-yellow-500 text-yellow-900 hover:bg-yellow-500",
                  !isAnswered && "bg-muted/50 hover:bg-muted",
                  isCurrent && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                )}
                onClick={() => handleNavigateToQuestion(index)}
              >
                {index + 1}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
