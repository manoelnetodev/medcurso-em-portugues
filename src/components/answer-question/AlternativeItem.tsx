import React from 'react';
import { cn } from '@/lib/utils';
import { Tables } from '@/integrations/supabase/types';
import { CheckCircle, XCircle, MessageSquare, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';

interface AlternativeItemProps {
  alternative: Tables<'alternativas'>;
  index: number;
  selectedAnswerId: number | null;
  showResult: boolean;
  isSubmitting: boolean;
  onSelect: (id: number) => void;
}

export const AlternativeItem: React.FC<AlternativeItemProps> = ({
  alternative,
  index,
  selectedAnswerId,
  showResult,
  isSubmitting,
  onSelect,
}) => {
  const letter = String.fromCharCode(65 + index);
  const isSelected = selectedAnswerId === alternative.id;
  const isCorrect = alternative.correta;

  const getAlternativeClasses = () => {
    if (showResult) {
      if (isCorrect) return 'border-success/50 bg-success/10 text-foreground';
      if (isSelected && !isCorrect) return 'border-destructive/50 bg-destructive/10 text-foreground';
      return 'border-border bg-card';
    }
    if (isSelected) {
      return 'border-primary bg-primary/10';
    }
    return 'border-border bg-card hover:border-primary/50';
  };

  return (
    <div
      onClick={() => onSelect(alternative.id)}
      className={cn(
        'flex items-center gap-4 p-4 rounded-lg border-2 transition-all cursor-pointer',
        getAlternativeClasses(),
        { 'cursor-not-allowed opacity-70': showResult || isSubmitting }
      )}
    >
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center font-bold text-sm',
          isSelected || (showResult && isCorrect) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
        )}
      >
        {letter}
      </div>
      <div className="flex-1 text-sm text-foreground/90">{alternative.alternativa_txt}</div>
      <div className="flex items-center gap-2">
        {showResult && isSelected && (isCorrect ? <CheckCircle className="w-5 h-5 text-success" /> : <XCircle className="w-5 h-5 text-destructive" />)}
        {showResult && !isSelected && isCorrect && <CheckCircle className="w-5 h-5 text-success" />}
      </div>
      <div className="flex items-center gap-1 ml-auto pl-4 border-l border-border">
        <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-primary">
            <MessageSquare className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-primary">
            <AlertCircle className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
