import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Bell, 
  Search, 
  Plus, 
  Settings, 
  User, 
  LogOut, 
  Moon, 
  Sun, 
  ChevronRight,
  BookOpen,
  FileText,
  Target,
  Brain,
  Clock,
  Award,
  HelpCircle,
  Menu,
  X,
  Maximize2,
  Minimize2,
  Filter,
  SortAsc,
  Grid,
  List
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showSearch?: boolean;
  showActions?: boolean;
  showBreadcrumbs?: boolean;
  actions?: React.ReactNode;
  onSearch?: (query: string) => void;
  onToggleView?: (view: 'grid' | 'list') => void;
  viewMode?: 'grid' | 'list';
  filters?: {
    label: string;
    value: string;
    options: { label: string; value: string }[];
    onChange: (value: string) => void;
  }[];
}

export function Header({
  title,
  subtitle,
  showSearch = false,
  showActions = true,
  showBreadcrumbs = true,
  actions,
  onSearch,
  onToggleView,
  viewMode = 'grid',
  filters = []
}: HeaderProps) {
  const { userProfile, signOut, loading } = useAuth();
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const getBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    return pathSegments.map((segment, index) => ({
      name: segment.charAt(0).toUpperCase() + segment.slice(1),
      path: '/' + pathSegments.slice(0, index + 1).join('/'),
      isLast: index === pathSegments.length - 1
    }));
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-6">
        {/* Top Bar */}
        <div className="flex h-16 items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            {/* Breadcrumbs */}
            {showBreadcrumbs && (
              <nav className="flex items-center space-x-1 text-sm">
                {getBreadcrumbs().map((breadcrumb, index) => (
                  <div key={breadcrumb.path} className="flex items-center">
                    {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />}
                    {breadcrumb.isLast ? (
                      <span className="font-medium text-foreground">{breadcrumb.name}</span>
                    ) : (
                      <Link 
                        to={breadcrumb.path}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {breadcrumb.name}
                      </Link>
                    )}
                  </div>
                ))}
              </nav>
            )}

            {/* Title Section */}
            {(title || subtitle) && (
              <div className="flex items-center space-x-4">
                <div className="h-6 w-px bg-border" />
                <div>
                  {title && <h1 className="text-lg font-semibold text-foreground">{title}</h1>}
                  {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
                </div>
              </div>
            )}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2">
            {/* Search */}
            {showSearch && (
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64 bg-muted/50 border-0 focus:bg-background"
                />
              </form>
            )}

            {/* Filters */}
            {filters.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Filtros
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Filtros</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {filters.map((filter) => (
                    <div key={filter.value} className="p-2">
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">
                        {filter.label}
                      </label>
                      <Select value={filter.value} onValueChange={filter.onChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {filter.options.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* View Toggle */}
            {onToggleView && (
              <div className="flex items-center border border-border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onToggleView('grid')}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onToggleView('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Custom Actions */}
            {actions}

            {/* Theme Toggle */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleDarkMode}
              className="hover:bg-muted/50"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative hover:bg-muted/50">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-background animate-pulse"></span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80" align="end">
                <DropdownMenuLabel>Notificações</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="p-4 text-center text-muted-foreground">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhuma notificação no momento</p>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Quick Actions */}
            {showActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:bg-muted/50">
                    <Plus className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Ações Rápidas</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <BookOpen className="mr-2 h-4 w-4" />
                    <span>Nova Questão</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <FileText className="mr-2 h-4 w-4" />
                    <span>Nova Prova</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Target className="mr-2 h-4 w-4" />
                    <span>Nova Lista</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Brain className="mr-2 h-4 w-4" />
                    <span>Novo Flashcard</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-muted/50">
                  {!loading && userProfile ? (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={userProfile.avatar_url || undefined} alt={userProfile.name || userProfile.email || "User"} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                        {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : (userProfile.email ? userProfile.email.charAt(0).toUpperCase() : 'U')}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
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
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
} 