
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
  useSidebar,
} from "@/components/ui/sidebar";
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
  Award
} from 'lucide-react';

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
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-primary text-primary-foreground font-medium" 
      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground";

  const isCollapsed = state === "collapsed";

  return (
    <Sidebar className={isCollapsed ? "w-16" : "w-64"} collapsible="icon">
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
              <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
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
                        <item.icon className="w-5 h-5" />
                        {!isCollapsed && <span className="ml-3">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
