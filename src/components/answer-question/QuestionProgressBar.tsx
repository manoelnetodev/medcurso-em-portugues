import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { RespostaListaWithQuestion } from '@/pages/AnswerQuestionPage'; // Importar o tipo

interface QuestionProgressBarProps {
  currentQuestionIndex: number;
  totalQuestions: number;
  respostasLista: RespostaListaWithQuestion[];
}

export const QuestionProgressBar: React.FC<QuestionProgressBarProps> = ({
  currentQuestionIndex,
  totalQuestions,
  respostasLista,
}) => {
  const currentQuestionNumber = currentQuestionIndex + 1;
  const progressValue = (currentQuestionNumber / totalQuestions) * 100;

  const correctCount = respostasLista.filter(r => r.respondeu && r.acertou).length;
  const incorrectCount = respostasLista.filter(r => r.respondeu && !r.acertou).length;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Progresso da Lista</span>
          <span className="text-sm text-muted-foreground">
            {currentQuestionNumber} de {totalQuestions} questões
          </span>
        </div>
        <Progress value={progressValue} className="mb-4 h-2" />
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-green-600">
              <CheckCircle className="w-4 h-4 mr-1" />{' '}
              {correctCount} corretas
            </div>
            <div className="flex items-center text-red-600">
              <XCircle className="w-4 h-4 mr-1" />{' '}
              {incorrectCount} erradas
            </div>
          </div>
          <div className="flex items-center text-muted-foreground">
            <Clock className="w-4 h-4 mr-1" />
            0:00 {/* TODO: Implementar cronômetro */}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
