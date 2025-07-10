import React from 'react';
import { CheckCircle, XCircle, MinusCircle, MessageSquare, Edit } from 'lucide-react';

export const ResponseCardLegend: React.FC = () => {
  const legendItems = [
    { label: 'Acertou', color: 'bg-success', icon: <CheckCircle className="w-3 h-3 text-success-foreground" /> },
    { label: 'Errou', color: 'bg-destructive', icon: <XCircle className="w-3 h-3 text-destructive-foreground" /> },
    { label: 'Anulada', color: 'bg-yellow-500', icon: <MinusCircle className="w-3 h-3 text-yellow-900" /> },
    { label: 'Discursiva', color: 'bg-blue-500', icon: <Edit className="w-3 h-3 text-blue-100" /> },
    { label: 'Questão atual', color: 'bg-primary', icon: <div className="w-3 h-3 border-2 border-primary-foreground rounded-full" /> },
  ];

  return (
    <div className="p-2 mb-4 border-b border-border">
      <div className="grid grid-cols-3 gap-x-2 gap-y-2">
        {legendItems.map(item => (
          <div key={item.label} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${item.color}`}>
              {item.icon}
            </div>
            <span className="text-xs text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
