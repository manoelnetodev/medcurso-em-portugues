import React from 'react';
import { cn } from '@/lib/utils';
import { Tables } from '@/integrations/supabase/types';
import { CheckCircle, XCircle, MessageSquare, AlertCircle, Circle } from 'lucide-react';
import { Button } from '../ui/button';

interface AlternativeItemProps {
  alternative: Tables<'alternativas'>;
  index: number;
  selectedAnswerId: number | null;
  showResult: boolean;
  isSubmitting: boolean;
  onSelect: (id: number) => void;
  isQuestionAnnulled?: boolean;
}

export const AlternativeItem: React.FC<AlternativeItemProps> = ({
  alternative,
  index,
  selectedAnswerId,
  showResult,
  isSubmitting,
  onSelect,
  isQuestionAnnulled = false,
}) => {
  const letter = String.fromCharCode(65 + index);
  const isSelected = selectedAnswerId === alternative.id;
  const isCorrect = alternative.correta;

  const getAlternativeClasses = () => {
    if (showResult) {
      // Se a questão está anulada, todas as alternativas ficam verdes
      if (isQuestionAnnulled) {
        return 'border-success/50 bg-success/10 text-foreground shadow-lg shadow-success/10';
      }
      if (isCorrect) {
        return 'border-success/50 bg-success/10 text-foreground shadow-lg shadow-success/10';
      }
      if (isSelected && !isCorrect) {
        return 'border-destructive/50 bg-destructive/10 text-foreground shadow-lg shadow-destructive/10';
      }
      return 'border-border bg-card/50 hover:bg-card/80';
    }
    if (isSelected) {
      return 'border-primary bg-primary/10 text-foreground shadow-lg shadow-primary/10';
    }
    return 'border-border bg-card/50 hover:border-primary/50 hover:bg-card/80 hover:shadow-md transition-all duration-200';
  };

  const getLetterClasses = () => {
    if (showResult) {
      // Se a questão está anulada, todas as letras ficam verdes
      if (isQuestionAnnulled) {
        return 'bg-success text-success-foreground shadow-lg';
      }
      if (isCorrect) {
        return 'bg-success text-success-foreground shadow-lg';
      }
      if (isSelected && !isCorrect) {
        return 'bg-destructive text-destructive-foreground shadow-lg';
      }
      return 'bg-muted text-muted-foreground';
    }
    if (isSelected) {
      return 'bg-primary text-primary-foreground shadow-lg';
    }
    return 'bg-muted text-muted-foreground hover:bg-primary/20 hover:text-primary transition-colors';
  };

  return (
    <div
      onClick={() => onSelect(alternative.id)}
      className={cn(
        'group relative flex items-start gap-3 p-3 rounded-lg border-2 transition-all duration-300 cursor-pointer',
        getAlternativeClasses(),
        { 
          'cursor-not-allowed opacity-70': showResult || isSubmitting,
          'transform hover:scale-[1.01] active:scale-[0.99]': !showResult && !isSubmitting
        }
      )}
    >
      {/* Background glow effect for selected/correct answers */}
      {(isSelected || (showResult && (isCorrect || isQuestionAnnulled))) && (
        <div className={cn(
          'absolute inset-0 rounded-lg opacity-20 blur-xl transition-opacity',
          (isCorrect || isQuestionAnnulled) ? 'bg-success' : isSelected ? 'bg-primary' : 'bg-destructive'
        )} />
      )}

      {/* Letter indicator */}
      <div
        className={cn(
          'relative flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm transition-all duration-300',
          getLetterClasses()
        )}
      >
        {letter}
      </div>

      {/* Alternative text */}
      <div className="flex-1 min-w-0">
        <div className="text-sm text-foreground/90 leading-relaxed font-medium pr-2">
          {alternative.alternativa_txt}
        </div>
      </div>

      {/* Status indicators */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {showResult && (
          <div className="flex items-center gap-1">
            {/* Questão anulada - todas as alternativas mostram como corretas */}
            {isQuestionAnnulled && (
              <div className="flex items-center gap-1 text-success bg-success/10 px-2 py-1 rounded-lg">
                <CheckCircle className="w-3 h-3" />
                <span className="text-xs font-medium">Questão anulada</span>
              </div>
            )}
            
            {/* Lógica normal para questões não anuladas */}
            {!isQuestionAnnulled && (
              <>
                {isSelected && isCorrect && (
                  <div className="flex items-center gap-1 text-success bg-success/10 px-2 py-1 rounded-lg">
                    <CheckCircle className="w-3 h-3" />
                    <span className="text-xs font-medium">Correta</span>
                  </div>
                )}
                {isSelected && !isCorrect && (
                  <div className="flex items-center gap-1 text-destructive bg-destructive/10 px-2 py-1 rounded-lg">
                    <XCircle className="w-3 h-3" />
                    <span className="text-xs font-medium">Incorreta</span>
                  </div>
                )}
                {!isSelected && isCorrect && (
                  <div className="flex items-center gap-1 text-success bg-success/10 px-2 py-1 rounded-lg">
                    <CheckCircle className="w-3 h-3" />
                    <span className="text-xs font-medium">Resposta correta</span>
                  </div>
                )}
              </>
            )}
          </div>
        )}
        
        {!showResult && isSelected && (
          <div className="flex items-center gap-1 text-primary bg-primary/10 px-2 py-1 rounded-lg">
            <Circle className="w-3 h-3 fill-current" />
            <span className="text-xs font-medium">Selecionada</span>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1 flex-shrink-0 pl-2 border-l border-border/50">
        <Button 
          variant="ghost" 
          size="icon" 
          className="w-6 h-6 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors rounded-lg"
          onClick={(e) => {
            e.stopPropagation();
            // TODO: Implement comment functionality
          }}
        >
          <MessageSquare className="w-3 h-3" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="w-6 h-6 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors rounded-lg"
          onClick={(e) => {
            e.stopPropagation();
            // TODO: Implement report functionality
          }}
        >
          <AlertCircle className="w-3 h-3" />
        </Button>
      </div>

      {/* Hover effect overlay */}
      {!showResult && !isSubmitting && (
        <div className="absolute inset-0 rounded-lg bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
      )}
    </div>
  );
};
