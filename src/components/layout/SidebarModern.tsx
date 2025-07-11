import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home, BookOpen, FileText, List as ListIcon, Brain, Clock, Award, LifeBuoy, Settings, ChevronLeft, ChevronRight, User, LogOut, BarChart3, Users, HelpCircle, TrendingUp
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Dashboard', icon: Home, path: '/dashboard' },
  { name: 'Questões', icon: BookOpen, path: '/questoes' },
  { name: 'Provas', icon: FileText, path: '/provas', badge: '3' },
  { name: 'Listas', icon: ListIcon, path: '/listas' },
  { name: 'Resultados', icon: TrendingUp, path: '/resultados' },
  { name: 'Ranking', icon: Award, path: '/ranking' },
];

const secondaryItems = [
  { name: 'Flashcards', icon: Brain, path: '/flashcards' },
  { name: 'Cronograma', icon: Clock, path: '/cronograma' },
  { name: 'Instituições', icon: Users, path: '/instituicoes' },
];

const supportItems = [
  { name: 'Ajuda', icon: HelpCircle, path: '/help' },
  { name: 'Configurações', icon: Settings, path: '/settings' },
];

interface SidebarModernProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export function SidebarModern({ collapsed, setCollapsed }: SidebarModernProps) {
  const location = useLocation();
  const { userProfile, signOut } = useAuth();

  const NavItem = ({ item, isActive }: { item: any; isActive: boolean }) => {
    const Icon = item.icon;
    
    return (
      <Link
        to={item.path}
        className={cn(
          "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-accent hover:text-accent-foreground",
          isActive 
            ? "bg-primary text-primary-foreground shadow-sm" 
            : "text-muted-foreground hover:text-foreground",
          collapsed && "justify-center px-3"
        )}
        title={collapsed ? item.name : undefined}
      >
        <Icon className={cn("h-4 w-4 flex-shrink-0", isActive && "text-primary-foreground")} />
        {!collapsed && (
          <>
            <span className="truncate">{item.name}</span>
            {item.badge && (
              <Badge 
                variant={isActive ? "secondary" : "outline"} 
                className="ml-auto h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {item.badge}
              </Badge>
            )}
          </>
        )}
      </Link>
    );
  };

  const SectionTitle = ({ title }: { title: string }) => {
    if (collapsed) return null;
    
    return (
      <div className="px-3 py-2">
        <h2 className="mb-2 px-2 text-xs font-semibold tracking-tight text-muted-foreground uppercase">
          {title}
        </h2>
      </div>
    );
  };

  return (
    <div className={cn(
      "flex h-screen flex-col border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      collapsed ? "w-[70px]" : "w-64"
    )}>
      {/* Header */}
      <div className="flex h-[60px] items-center border-b px-3">
        <Link to="/dashboard" className="flex items-center gap-2 font-semibold">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white p-1">
            <img 
              src="/logo.png" 
              alt="UltraMeds Logo" 
              className="h-full w-full object-contain rounded-md"
              onError={(e) => {
                // Fallback para o ícone anterior se a logo não carregar
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="hidden h-full w-full items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <BookOpen className="h-4 w-4" />
            </div>
          </div>
          {!collapsed && (
            <span className="text-lg font-bold medcurso-text-gradient">
              UltraMeds
            </span>
          )}
        </Link>
        {!collapsed && (
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto h-8 w-8"
            onClick={() => setCollapsed(true)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
        {collapsed && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-[60px] top-[14px] z-50 h-8 w-8 rounded-full border bg-background shadow-md"
            onClick={() => setCollapsed(false)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-auto py-4">
        <div className="space-y-1 px-3">
          {navItems.map((item) => (
            <NavItem 
              key={item.name} 
              item={item} 
              isActive={location.pathname === item.path} 
            />
          ))}
        </div>

        {!collapsed && <SectionTitle title="Ferramentas" />}
        <div className="space-y-1 px-3">
          {secondaryItems.map((item) => (
            <NavItem 
              key={item.name} 
              item={item} 
              isActive={location.pathname === item.path} 
            />
          ))}
        </div>

        {!collapsed && <SectionTitle title="Suporte" />}
        <div className="space-y-1 px-3">
          {supportItems.map((item) => (
            <NavItem 
              key={item.name} 
              item={item} 
              isActive={location.pathname === item.path} 
            />
          ))}
        </div>
      </div>

      {/* User Section */}
      <div className="border-t p-3">
        {collapsed ? (
          <div className="flex justify-center">
            <Avatar className="h-8 w-8">
              <AvatarImage src={userProfile?.avatar_url || ''} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={userProfile?.avatar_url || ''} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-0.5">
              <p className="text-sm font-medium leading-none">
                {userProfile?.name || 'Usuário'}
              </p>
              <p className="text-xs text-muted-foreground">
                {userProfile?.email}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={signOut}
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 