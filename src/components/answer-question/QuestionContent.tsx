import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QuestionDetails } from '@/pages/AnswerQuestionPage'; // Importar o tipo
import { Tables } from '@/integrations/supabase/types';

interface QuestionContentProps {
  currentQuestion: QuestionDetails;
  selectedAnswerId: number | null;
  showResult: boolean;
  submitting: boolean;
  errorReason: Tables<'public', 'Enums', 'motivo_erro'> | null;
  handleAnswerSelect: (answerId: number) => void;
  motivoErroOptions: { label: string; value: Tables<'public', 'Enums', 'motivo_erro'> }[];
  setErrorReason: (reason: Tables<'public', 'Enums', 'motivo_erro'> | null) => void;
  isCurrentQuestionAnsweredCorrectly: boolean; // Nova prop para verificar se a questão atual foi acertada
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
    <Card>
      <CardContent className="space-y-6">
        {/* Adicionado número da questão e nome da prova */}
        <div className="mb-4">
          <p className="text-orange-600 font-semibold text-lg">
            {currentQuestion.numero} - {currentQuestion.instituicao} - {currentQuestion.ano} (R1)
          </p>
        </div>

        {/* Question Text */}
        <div className="prose prose-sm max-w-none">
          <p className="text-foreground leading-relaxed">
            {currentQuestion.enunciado}
          </p>
        </div>

        {/* Alternatives */}
        <div className="space-y-3">
          {currentQuestion.alternativas.map((alt) => (
            <button
              key={alt.id}
              onClick={() => handleAnswerSelect(alt.id)}
              disabled={showResult || submitting}
              className={`w-full text-left p-4 rounded-lg border transition-colors ${
                selectedAnswerId === alt.id
                  ? showResult
                    ? alt.correta
                      ? 'border-green-500 bg-green-50 text-green-800'
                      : 'border-red-500 bg-red-50 text-red-800'
                    : 'border-primary bg-primary/5 text-primary'
                  : showResult && alt.correta
                  ? 'border-green-500 bg-green-50 text-green-800'
                  : 'border-border hover:border-muted-foreground bg-card hover:bg-muted/50'
              }`}
            >
              <div className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-xs font-medium">
                  {alt.alternativa_txt?.trim()?.charAt(0)?.toUpperCase() || ''} {/* Extrai a primeira letra do texto */}
                </span>
                <span className="flex-1">{alt.alternativa_txt}</span>
                {showResult && selectedAnswerId === alt.id && (
                  alt.correta ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )
                )}
                {showResult && alt.correta && selectedAnswerId !== alt.id && (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Explanation (shown after answer) */}
        {showResult && (
          <div className="border-t pt-6 space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Explicação</h4>
              <p className="text-blue-800 text-sm leading-relaxed">
                {currentQuestion.comentario || "Nenhuma explicação disponível."}
              </p>
            </div>

            {/* Motivo do Erro */}
            {!isCurrentQuestionAnsweredCorrectly && !currentQuestion.anulada && (
              <div className="space-y-2">
                <label htmlFor="error-reason" className="text-sm font-medium text-foreground">
                  Motivo do Erro:
                </label>
                <Select value={errorReason || ''} onValueChange={(value) => setErrorReason(value as Tables<'public', 'Enums', 'motivo_erro'>)} disabled={submitting}>
                  <SelectTrigger id="error-reason" className="w-full">
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

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-muted rounded-lg p-3">
                <div className="text-lg font-bold text-foreground">
                  {currentQuestion.percentual_acertos || 0}%
                </div>
                <div className="text-xs text-muted-foreground">Acertos na questão</div>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <div className="text-lg font-bold text-primary">
                  {/* TODO: Calcular seu histórico de acertos nesta questão */}
                  N/A%
                </div>
                <div className="text-xs text-muted-foreground">Seu histórico</div>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <div className="text-lg font-bold text-foreground">
                  {/* TODO: Calcular total de vezes que respondeu esta questão */}
                  N/A
                </div>
                <div className="text-xs text-muted-foreground">Total de respostas</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
