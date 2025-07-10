
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
  LogOut
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const menuItems = [
  {
    title: "Principal",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: Home },
      { title: "Questões", url: "/questoes", icon: BookOpen },
      { title: "Provas", url: "/provas", icon: FileText },
      { title: "Listas", url: "/listas", icon: Target },
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

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { userProfile, signOut } = useAuth();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-primary text-primary-foreground font-medium" 
      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground";

  const isCollapsed = state === "collapsed";

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
    <Sidebar className="border-r border-border" collapsible="icon">
      <SidebarHeader className="border-b border-border p-4">
        <div className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
            <Stethoscope className="w-5 h-5 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="text-lg font-bold text-foreground">MedCurso</h2>
              <p className="text-xs text-muted-foreground">Residência Médica</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {menuItems.map((group, groupIndex) => (
          <SidebarGroup key={groupIndex}>
            {!isCollapsed && (
              <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
                {group.title}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        end 
                        className={getNavCls}
                      >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        <span className="ml-3 text-sm font-medium">{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src={userProfile?.avatar_url || ''} />
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {userProfile?.name || 'Usuário'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {userProfile?.email}
              </p>
            </div>
          )}
          
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
      </SidebarFooter>
    </Sidebar>
  );
}
