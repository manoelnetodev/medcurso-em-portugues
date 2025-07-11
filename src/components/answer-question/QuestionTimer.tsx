import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Pause, Play, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuestionTimerProps {
  isActive?: boolean;
  onTimeUp?: () => void;
  className?: string;
}

export const QuestionTimer: React.FC<QuestionTimerProps> = ({
  isActive = false,
  onTimeUp,
  className
}) => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && !isPaused) {
      interval = setInterval(() => {
        setTime(prevTime => {
          const newTime = prevTime + 1;
          if (newTime >= 3600) { // 1 hour limit
            setIsRunning(false);
            onTimeUp?.();
            return prevTime;
          }
          return newTime;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, isPaused, onTimeUp]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsRunning(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(true);
  };

  const handleResume = () => {
    setIsPaused(false);
  };

  const handleReset = () => {
    setTime(0);
    setIsRunning(false);
    setIsPaused(false);
  };

  const getTimeColor = () => {
    if (time < 300) return 'text-success'; // Less than 5 minutes
    if (time < 600) return 'text-warning'; // Less than 10 minutes
    return 'text-destructive'; // More than 10 minutes
  };

  return (
    <Card className={cn("border-0 shadow-lg bg-gradient-to-br from-card to-card/50 backdrop-blur-sm rounded-xl", className)}>
      <CardContent className="p-3">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-primary/10 rounded-lg">
                <Clock className="h-3 w-3 text-primary" />
              </div>
              <div>
                <div className="text-xs font-medium text-muted-foreground/80">Cronômetro</div>
                <div className={cn("text-base font-bold", getTimeColor())}>
                  {formatTime(time)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {!isRunning ? (
                <Button
                  size="sm"
                  onClick={handleStart}
                  className="bg-primary hover:bg-primary/90 h-7 px-2 rounded-lg"
                >
                  <Play className="h-3 w-3 mr-1" />
                  <span className="text-xs">Iniciar</span>
                </Button>
              ) : isPaused ? (
                <Button
                  size="sm"
                  onClick={handleResume}
                  variant="outline"
                  className="h-7 px-2 rounded-lg"
                >
                  <Play className="h-3 w-3 mr-1" />
                  <span className="text-xs">Continuar</span>
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handlePause}
                  variant="outline"
                  className="h-7 px-2 rounded-lg"
                >
                  <Pause className="h-3 w-3 mr-1" />
                  <span className="text-xs">Pausar</span>
                </Button>
              )}
              
              <Button
                size="sm"
                onClick={handleReset}
                variant="ghost"
                className="text-muted-foreground hover:text-foreground h-7 w-7 p-0 rounded-lg"
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="w-full h-1.5 bg-muted rounded-xl overflow-hidden">
            <div 
              className={cn(
                "h-full transition-all duration-300 rounded-xl",
                time < 300 ? "bg-success" : time < 600 ? "bg-yellow-500" : "bg-destructive"
              )}
              style={{ width: `${Math.min((time / 600) * 100, 100)}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 