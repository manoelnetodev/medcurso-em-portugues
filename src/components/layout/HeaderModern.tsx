import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, ChevronRight, Plus, User, LogOut, Settings, Moon, Sun, Search, Menu } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { RippleButton } from '@/components/ui/ripple-button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useSearch } from '@/hooks/useSearch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface HeaderModernProps {
  customBreadcrumbs?: string[];
  onMenuToggle?: () => void;
}

export function HeaderModern({ customBreadcrumbs, onMenuToggle }: HeaderModernProps) {
  const location = useLocation();
  const { userProfile, signOut, loading } = useAuth();
  const { searchQuery, setSearchQuery, isSearching, handleSearch } = useSearch();
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

  const getBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    return pathSegments.map((segment, index) => ({
      name: segment.charAt(0).toUpperCase() + segment.slice(1),
      path: '/' + pathSegments.slice(0, index + 1).join('/'),
      isLast: index === pathSegments.length - 1
    }));
  };

  const breadcrumbs = getBreadcrumbs();
  if (customBreadcrumbs && customBreadcrumbs.length > 0) {
    // Substitui o último breadcrumb pelo nome customizado
    breadcrumbs[breadcrumbs.length - 1].name = customBreadcrumbs[customBreadcrumbs.length - 1];
  }

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

  const getPageTitle = () => {
    if (customBreadcrumbs && customBreadcrumbs.length > 0) {
      return customBreadcrumbs[customBreadcrumbs.length - 1];
    }
    
    const path = location.pathname;
    const routes: Record<string, string> = {
      '/dashboard': 'Dashboard',
      '/questoes': 'Questões',
      '/provas': 'Provas',
      '/listas': 'Listas de Estudo',
      '/resultados': 'Resultados',
      '/ranking': 'Ranking',
      '/flashcards': 'Flashcards',
      '/cronograma': 'Cronograma',
      '/instituicoes': 'Instituições',
      '/settings': 'Configurações',
      '/comunidade': 'Comunidade',
    };
    
    // Tratar rotas dinâmicas (como /questoes/:listId)
    if (path.startsWith('/questoes/')) {
      return 'Respondendo Questões';
    }
    if (path.startsWith('/resultados/')) {
      return 'Resultados da Lista';
    }

    return routes[path] || 'UltraMeds';
  };

  const getPageSubtitle = () => {
    const path = location.pathname;
    const subtitles: Record<string, string> = {
      '/dashboard': 'Visão geral do seu progresso e atividades recentes',
      '/questoes': 'Pratique com questões organizadas por disciplina',
      '/provas': 'Simulados e provas anteriores para prática',
      '/listas': 'Listas de estudo personalizadas e organizadas',
      '/resultados': 'Análise detalhada do seu desempenho',
      '/ranking': 'Compare seu desempenho com outros estudantes',
      '/flashcards': 'Cartões de estudo para memorização eficiente',
      '/cronograma': 'Organize seus estudos com planejamento',
      '/instituicoes': 'Questões organizadas por instituição',
      '/settings': 'Personalize sua experiência de estudo',
      '/comunidade': 'Compartilhe conhecimento e tire suas dúvidas',
    };
    
    // Tratar subtítulos dinâmicos
    if (path.startsWith('/questoes/')) {
      return 'Responda as questões e acompanhe seu progresso';
    }
    if (path.startsWith('/resultados/')) {
      return 'Análise detalhada dos seus resultados';
    }

    return subtitles[path] || '';
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left Section - Page Info */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-9 w-9"
            onClick={onMenuToggle}
          >
            <Menu className="h-4 w-4" />
          </Button>
          
          {/* Breadcrumbs */}
          <nav className="hidden sm:flex items-center space-x-1 text-sm text-muted-foreground">
            <Link 
              to="/dashboard" 
              className="hover:text-foreground transition-colors"
            >
              Início
            </Link>
            {breadcrumbs.map((breadcrumb, index) => (
              <React.Fragment key={breadcrumb.path}>
                <ChevronRight className="h-3 w-3 mx-1" />
                {breadcrumb.isLast ? (
                  <span className="font-medium text-foreground">{breadcrumb.name}</span>
                ) : (
                  <Link 
                    to={breadcrumb.path} 
                    className="hover:text-foreground transition-colors"
                  >
                    {breadcrumb.name}
                  </Link>
                )}
              </React.Fragment>
            ))}
          </nav>
        </div>

        {/* Center Section - Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <form onSubmit={(e) => { e.preventDefault(); handleSearch(searchQuery); }} className="w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar questões, provas, listas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={isSearching}
                className="pl-9 bg-muted/50 border-0 focus-visible:bg-background"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent"></div>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Mobile Search Button */}
        <div className="md:hidden">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {/* Right Section - Actions & User */}
        <div className="flex items-center space-x-2">
          {/* Theme Toggle */}
          <RippleButton 
            variant="ghost" 
            size="icon" 
            onClick={toggleDarkMode}
            rippleColor="rgba(139, 92, 246, 0.3)"
            className="h-9 w-9"
            title={isDarkMode ? "Alternar para modo claro" : "Alternar para modo escuro"}
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </RippleButton>

          {/* Notifications */}
          <RippleButton 
            variant="ghost" 
            size="icon" 
            rippleColor="rgba(236, 72, 153, 0.3)"
            className="relative h-9 w-9"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2 h-2 w-2 bg-primary rounded-full border border-background animate-pulse"></span>
          </RippleButton>

          {/* Quick Actions */}
          <RippleButton 
            variant="ghost" 
            size="icon" 
            rippleColor="rgba(34, 197, 94, 0.3)"
            className="h-9 w-9"
          >
            <Plus className="h-4 w-4" />
          </RippleButton>

          {/* User Menu */}
          {!loading && userProfile && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-3 px-3 h-9">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={userProfile.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 
                       (userProfile.email ? userProfile.email.charAt(0).toUpperCase() : 'U')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium leading-none">
                      {userProfile.name || 'Usuário'}
                    </p>
                    <p className="text-xs text-muted-foreground leading-none mt-0.5">
                      {userProfile.email}
                    </p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end">
                <DropdownMenuLabel className="pb-2">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={userProfile.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{userProfile.name || 'Usuário'}</p>
                      <p className="text-xs text-muted-foreground">{userProfile.email}</p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configurações</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={signOut} 
                  className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Page Title Section */}
      <div className="border-t bg-muted/30 px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-foreground truncate">
              {getPageTitle()}
            </h1>
            {getPageSubtitle() && (
              <p className="text-sm text-muted-foreground mt-1 hidden sm:block">
                {getPageSubtitle()}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2 ml-4">
            {/* Page-specific actions can be added here */}
          </div>
        </div>
      </div>
    </header>
  );
} 