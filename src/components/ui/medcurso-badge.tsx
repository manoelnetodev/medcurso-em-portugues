import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface MedCursoBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  glow?: boolean;
}

export function MedCursoBadge({ 
  children, 
  variant = 'default', 
  size = 'md', 
  className, 
  glow = false 
}: MedCursoBadgeProps) {
  const baseClasses = "font-medium transition-all duration-300";
  
  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2"
  };

  const variantClasses = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline: "border-2 border-primary text-primary bg-transparent hover:bg-primary/10",
    gradient: "medcurso-gradient text-white shadow-lg hover:shadow-xl"
  };

  const glowClasses = glow ? "animate-glow-pulse shadow-lg" : "";

  return (
    <Badge
      className={cn(
        baseClasses,
        sizeClasses[size],
        variantClasses[variant],
        glowClasses,
        className
      )}
    >
      {children}
    </Badge>
  );
} 