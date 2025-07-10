import React from 'react';
import { Button } from "@/components/ui/button";
import { Eye, AlertTriangle, BookOpen, HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react';

interface QuestionHeaderProps {
  instituicao: string | null | undefined;
  ano: number | null | undefined;
  totalQuestions: number;
  currentQuestionIndex: number;
  handlePreviousQuestion: () => void;
  handleNextQuestion: () => void;
}

export const QuestionHeader: React.FC<QuestionHeaderProps> = ({
  instituicao,
  ano,
  totalQuestions,
  currentQuestionIndex,
  handlePreviousQuestion,
  handleNextQuestion,
}) => {
  const currentQuestionNumber = currentQuestionIndex + 1;

  return (
    <div className="flex flex-col border-b border-border bg-card">
      {/* Top Bar with Action Buttons */}
      <div className="flex items-center justify-end p-3 border-b border-border">
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <Button variant="ghost" className="flex items-center space-x-1 px-2 py-1 h-auto">
            <Eye className="w-4 h-4" />
            <span>Modo prova</span>
          </Button>
          <Button variant="ghost" className="flex items-center space-x-1 px-2 py-1 h-auto">
            <AlertTriangle className="w-4 h-4" />
            <span>Relatar Erro</span>
          </Button>
          <Button variant="ghost" className="flex items-center space-x-1 px-2 py-1 h-auto">
            <BookOpen className="w-4 h-4" />
            <span>Anotações</span>
          </Button>
          <Button variant="ghost" className="flex items-center space-x-1 px-2 py-1 h-auto">
            <HelpCircle className="w-4 h-4" />
            <span>Dúvidas</span>
          </Button>
        </div>
      </div>

      {/* Main Header with Navigation and Title */}
      <div className="flex items-center justify-between p-4">
        {/* Left Navigation */}
        <Button
          variant="ghost"
          onClick={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0}
          className="flex items-center space-x-1 text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Questão anterior</span>
        </Button>

        {/* Center Title and Progress */}
        <div className="flex flex-col items-center text-center">
          <h1 className="text-lg font-semibold text-foreground">
            {instituicao} - {ano} (R1)
          </h1>
          <p className="text-sm text-muted-foreground">
            {currentQuestionNumber} / {totalQuestions}
          </p>
        </div>

        {/* Right Navigation */}
        <Button
          variant="ghost"
          onClick={handleNextQuestion}
          disabled={currentQuestionIndex === totalQuestions - 1}
          className="flex items-center space-x-1 text-muted-foreground hover:text-foreground"
        >
          <span>Questão seguinte</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
