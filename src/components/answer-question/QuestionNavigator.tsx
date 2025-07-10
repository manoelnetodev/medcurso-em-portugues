import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface QuestionNavigatorProps {
  current: number;
  total: number;
  onPrevious: () => void;
  onNext: () => void;
  isPreviousDisabled: boolean;
  isNextDisabled: boolean;
}

export const QuestionNavigator: React.FC<QuestionNavigatorProps> = ({
  current,
  total,
  onPrevious,
  onNext,
  isPreviousDisabled,
  isNextDisabled,
}) => {
  return (
    <div className="flex items-center justify-between p-4 bg-card border-b border-border">
      <Button variant="ghost" size="sm" onClick={onPrevious} disabled={isPreviousDisabled}>
        <ChevronLeft className="w-4 h-4 mr-2" />
        Questão anterior
      </Button>
      <div className="font-semibold text-foreground">
        {current} / {total}
      </div>
      <Button variant="ghost" size="sm" onClick={onNext} disabled={isNextDisabled}>
        Questão seguinte
        <ChevronRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
};
