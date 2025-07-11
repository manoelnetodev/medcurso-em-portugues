import React from 'react';
import { CheckCircle, XCircle, MinusCircle, MessageSquare, Edit, Circle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const ResponseCardLegend: React.FC = () => {
  const legendItems = [
    { 
      label: 'Acertou', 
      color: 'bg-success/20 border-success/40 text-success', 
      dot: 'bg-success'
    },
    { 
      label: 'Errou', 
      color: 'bg-destructive/20 border-destructive/40 text-destructive', 
      dot: 'bg-destructive'
    },
    { 
      label: 'Anulada', 
      color: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-600', 
      dot: 'bg-yellow-500'
    },
    { 
      label: 'Atual', 
      color: 'ring-2 ring-primary bg-primary/10 text-primary', 
      dot: 'bg-primary'
    },
  ];

  return (
    <div className="px-4 pb-3 border-b border-border/30">
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-foreground/80">Legenda</h4>
        <div className="grid grid-cols-2 gap-1.5">
          {legendItems.map(item => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div className={`w-5 h-5 rounded-md flex items-center justify-center border-2 ${item.color}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${item.dot}`} />
              </div>
              <span className="text-xs font-medium text-foreground/90 truncate">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
