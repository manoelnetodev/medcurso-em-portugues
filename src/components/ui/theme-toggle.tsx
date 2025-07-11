import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'ghost' | 'outline';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className, 
  size = 'default',
  variant = 'ghost' 
}) => {
  const [isDarkMode, setIsDarkMode] = React.useState(() => {
    // Verifica se existe preferência salva no localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    // Se não há preferência salva, verifica se o sistema está em dark mode
    return document.documentElement.classList.contains('dark') || 
           window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Aplica o tema inicial quando o componente monta
  React.useEffect(() => {
    // Adiciona classe para evitar transições no carregamento inicial
    document.documentElement.classList.add('no-transition');
    
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Remove a classe no-transition após um pequeno delay para permitir transições normais
    setTimeout(() => {
      document.documentElement.classList.remove('no-transition');
    }, 100);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    // Aplica o tema no documento com transição suave
    document.documentElement.classList.add('theme-transition');
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }

    // Remove a classe de transição após a animação
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transition');
    }, 200);
  };

  const sizeClasses = {
    sm: 'h-8 w-8',
    default: 'h-9 w-9', 
    lg: 'h-10 w-10'
  };

  return (
    <Button 
      variant={variant}
      size="icon"
      onClick={toggleDarkMode}
      className={cn(sizeClasses[size], className)}
      title={isDarkMode ? "Alternar para modo claro" : "Alternar para modo escuro"}
    >
      {isDarkMode ? (
        <Sun className={cn(
          size === 'sm' ? 'h-3 w-3' : 
          size === 'lg' ? 'h-5 w-5' : 
          'h-4 w-4'
        )} />
      ) : (
        <Moon className={cn(
          size === 'sm' ? 'h-3 w-3' : 
          size === 'lg' ? 'h-5 w-5' : 
          'h-4 w-4'
        )} />
      )}
    </Button>
  );
}; 