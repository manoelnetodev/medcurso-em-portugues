import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, AlertTriangle, FileText, HelpCircle } from 'lucide-react';

interface TopBarProps {
  title: string;
  questionCount: number;
}

export const TopBar: React.FC<TopBarProps> = ({ title, questionCount }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-card border-b border-border rounded-t-lg">
      <div>
        <h1 className="text-lg font-bold text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground">{questionCount} questões</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <Eye className="w-4 h-4 mr-2" />
          Modo prova
        </Button>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <AlertTriangle className="w-4 h-4 mr-2" />
          Relatar Erro
        </Button>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <FileText className="w-4 h-4 mr-2" />
          Anotações
        </Button>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <HelpCircle className="w-4 h-4 mr-2" />
          Dúvidas
        </Button>
      </div>
    </div>
  );
};
