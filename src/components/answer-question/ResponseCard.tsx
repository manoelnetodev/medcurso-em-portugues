import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from '@/lib/utils';
import { RespostaListaWithQuestion } from '@/pages/AnswerQuestionPage';

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
    <Card className="lg:col-span-1 h-full flex flex-col"> {/* Removido max-w-[400px] e mx-auto */}
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-foreground">Progresso da Lista</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-4">
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-1"> {/* Grid responsivo */}
          {respostasLista.map((resposta, index) => {
            const isCurrent = index === currentQuestionIndex;
            const isAnswered = resposta.respondeu;
            const isCorrect = resposta.acertou;

            return (
              <Button
                key={resposta.id}
                size="icon"
                className={cn(
                  "w-8 h-8 rounded-lg text-xs font-bold",
                  // Estilos para questões respondidas (correta/incorreta)
                  isAnswered && isCorrect && "bg-green-500 hover:bg-green-600 text-white",
                  isAnswered && !isCorrect && "bg-red-500 hover:bg-red-600 text-white",
                  // Estilos para questões não respondidas
                  !isAnswered && "bg-muted hover:bg-muted-foreground/10 text-muted-foreground",
                  // Estilos para a questão atual (sobrescreve os anteriores)
                  isCurrent && "bg-primary text-primary-foreground hover:bg-primary/90"
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
