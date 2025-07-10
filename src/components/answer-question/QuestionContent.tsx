import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QuestionDetails } from '@/pages/AnswerQuestionPage';
import { Tables } from '@/integrations/supabase/types';
import { AlternativeItem } from './AlternativeItem';

interface QuestionContentProps {
  currentQuestion: QuestionDetails;
  selectedAnswerId: number | null;
  showResult: boolean;
  submitting: boolean;
  errorReason: Tables<'public', 'Enums', 'motivo_erro'> | null;
  handleAnswerSelect: (answerId: number) => void;
  motivoErroOptions: { label: string; value: Tables<'public', 'Enums', 'motivo_erro'> }[];
  setErrorReason: (reason: Tables<'public', 'Enums', 'motivo_erro'> | null) => void;
  isCurrentQuestionAnsweredCorrectly: boolean;
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
}) => {
  return (
    <Card className="flex-1 bg-card border-none shadow-none">
      <CardContent className="p-6 space-y-6">
        <div>
          <p className="text-primary font-semibold text-sm mb-2">
            {currentQuestion.numero} - {currentQuestion.instituicao} - {currentQuestion.ano}
          </p>
          <div className="prose prose-invert prose-sm max-w-none text-foreground/90">
            <p>{currentQuestion.enunciado}</p>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground">Selecione a alternativa abaixo:</h3>
          {currentQuestion.alternativas.map((alt, index) => (
            <AlternativeItem
              key={alt.id}
              alternative={alt}
              index={index}
              selectedAnswerId={selectedAnswerId}
              showResult={showResult}
              isSubmitting={submitting}
              onSelect={handleAnswerSelect}
            />
          ))}
        </div>

        {showResult && (
          <div className="border-t border-border pt-6 space-y-4 animate-in fade-in-50">
            <div className="bg-primary/10 p-4 rounded-lg">
              <h4 className="font-bold text-primary mb-2">Explicação</h4>
              <div className="prose prose-invert prose-sm max-w-none text-foreground/80">
                <p>{currentQuestion.comentario || "Nenhuma explicação disponível."}</p>
              </div>
            </div>

            {!isCurrentQuestionAnsweredCorrectly && !currentQuestion.anulada && (
              <div className="space-y-2">
                <label htmlFor="error-reason" className="text-sm font-medium text-muted-foreground">
                  Classifique seu erro para otimizar seus estudos:
                </label>
                <Select value={errorReason || ''} onValueChange={(value) => setErrorReason(value as Tables<'public', 'Enums', 'motivo_erro'>)} disabled={submitting}>
                  <SelectTrigger id="error-reason" className="w-full md:w-1/2">
                    <SelectValue placeholder="Selecione o motivo do erro" />
                  </SelectTrigger>
                  <SelectContent>
                    {motivoErroOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="text-xl font-bold text-foreground">
                  {currentQuestion.percentual_acertos || 0}%
                </div>
                <div className="text-xs text-muted-foreground">Acertos na questão</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="text-xl font-bold text-primary">N/A%</div>
                <div className="text-xs text-muted-foreground">Seu histórico</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="text-xl font-bold text-foreground">N/A</div>
                <div className="text-xs text-muted-foreground">Total de respostas</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
