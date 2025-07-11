import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  BookOpen, 
  Target, 
  Brain, 
  Download, 
  BarChart3, 
  Settings, 
  User,
  Stethoscope,
  FileText,
  Clock,
  Award,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const menuItems = [
  {
    title: "Principal",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: Home },
      { title: "Questões", url: "/questoes", icon: BookOpen },
      { title: "Provas", url: "/provas", icon: FileText },
      { title: "Listas", url: "/listas", icon: Target }, // Garantir que a URL esteja correta
    ]
  },
  {
    title: "Estudos",
    items: [
      { title: "Flashcards", url: "/flashcards", icon: Brain },
      { title: "Cronograma", url: "/cronograma", icon: Clock },
      { title: "Materiais", url: "/materiais", icon: Download },
    ]
  },
  {
    title: "Análises",
    items: [
      { title: "Relatórios", url: "/relatorios", icon: BarChart3 },
      { title: "Ranking", url: "/ranking", icon: Award },
    ]
  },
  {
    title: "Conta",
    items: [
      { title: "Perfil", url: "/perfil", icon: User },
      { title: "Configurações", url: "/configuracoes", icon: Settings },
    ]
  }
];

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function AppSidebar({ isOpen, onToggle }: SidebarProps) {
  const location = useLocation();
  const { userProfile, signOut } = useAuth();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;

  const handleSignOut = async () => {
    await signOut();
  };

  const getUserInitials = () => {
    if (userProfile?.name) {
      return userProfile.name
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    return userProfile?.email?.[0]?.toUpperCase() || 'U';
  };

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-72 bg-card border-r border-border transition-transform duration-300 ease-in-out flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-xl">
              <Stethoscope className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">UltraMeds</h1>
              <p className="text-sm text-muted-foreground">Residência Médica</p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="lg:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation - Adicionado overflow-y-auto para rolagem interna e scrollbar-hide para esconder o scrollbar */}
        <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto scrollbar-hide">
          {menuItems.map((group, groupIndex) => (
            <div key={groupIndex} className="space-y-2">
              <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {group.title}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.url);
                  
                  return (
                    <NavLink
                      key={item.title}
                      to={item.url}
                      onClick={() => {
                        // Fecha o menu no mobile após clicar
                        if (window.innerWidth < 1024) {
                          onToggle();
                        }
                      }}
                      className={cn(
                        "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                        active
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span>{item.title}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer - User Profile - Adicionado flex-shrink-0 para garantir que não encolha */}
        <div className="p-4 border-t border-border flex-shrink-0">
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30">
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage src={userProfile?.avatar_url || ''} />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {userProfile?.name || 'Usuário'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {userProfile?.email}
              </p>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="h-8 w-8 text-muted-foreground hover:text-foreground flex-shrink-0"
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
