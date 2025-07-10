import React from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { Bell, User, Home, Book, List, BarChart2, LogOut, Search, ChevronsUpDown, Plus, Settings, LifeBuoy, Building } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupAction,
  SidebarMenuBadge,
  SidebarInput,
} from '@/components/ui/sidebar';

export function Layout() {
  const { userProfile, signOut, loading } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', icon: Home, path: '/dashboard' },
    { name: 'Provas', icon: Book, path: '/provas', badge: '3' },
    { name: 'Listas', icon: List, path: '/listas' },
    { name: 'Ranking', icon: BarChart2, path: '/ranking' },
  ];

  const projectItems = [
    { name: 'Cardiologia Avançada', color: 'bg-red-500' },
    { name: 'Neurologia Pediátrica', color: 'bg-blue-500' },
    { name: 'Casos Clínicos 2025', color: 'bg-green-500' },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex w-full bg-background">
        <Sidebar collapsible="icon" side="left" variant="sidebar">
          <SidebarHeader>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start items-center gap-2 px-2 group-data-[collapsible=icon]/sidebar-wrapper:justify-center group-data-[collapsible=icon]/sidebar-wrapper:px-0 group-data-[collapsible=icon]/sidebar-wrapper:size-8">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">M</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start truncate group-data-[state=collapsed]/sidebar-wrapper:hidden">
                    <span className="font-semibold text-sm text-foreground">MedCurso</span>
                    <span className="text-xs text-muted-foreground">Workspace</span>
                  </div>
                  <ChevronsUpDown className="h-4 w-4 ml-auto text-muted-foreground group-data-[state=collapsed]/sidebar-wrapper:hidden" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="start">
                <DropdownMenuLabel>Meus Workspaces</DropdownMenuLabel>
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <Building className="mr-2 h-4 w-4" />
                    <span>MedCurso</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Building className="mr-2 h-4 w-4" />
                    <span>Residência Pro</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Plus className="mr-2 h-4 w-4" />
                  <span>Novo Workspace</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="relative group-data-[state=expanded]/sidebar-wrapper:px-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground group-data-[state=collapsed]/sidebar-wrapper:left-1.5" />
              <SidebarInput placeholder="Buscar..." className="pl-8 group-data-[state=collapsed]/sidebar-wrapper:hidden" />
            </div>
          </SidebarHeader>

          <SidebarContent className="flex-1 p-2 space-y-1">
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.path}
                    tooltip={item.name}
                  >
                    <Link to={item.path}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                  {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Projetos</SidebarGroupLabel>
              <SidebarGroupAction tooltip="Novo Projeto">
                <Plus />
              </SidebarGroupAction>
              <SidebarMenu>
                {projectItems.map((item) => (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild tooltip={item.name}>
                      <Link to="#">
                        <span className={`h-2 w-2 ${item.color} rounded-full`} />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="p-2">
            <SidebarMenu>
               <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Ajuda & Feedback">
                    <Link to="#">
                      <LifeBuoy className="h-5 w-5" />
                      <span>Ajuda & Feedback</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Configurações" isActive={location.pathname === '/settings'}>
                    <Link to="/settings">
                      <Settings className="h-5 w-5" />
                      <span>Configurações</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
            <SidebarSeparator />
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start items-center gap-3 p-2 h-auto group-data-[collapsible=icon]/sidebar-wrapper:justify-center group-data-[collapsible=icon]/sidebar-wrapper:px-0 group-data-[collapsible=icon]/sidebar-wrapper:size-10">
                  {!loading && userProfile ? (
                    <>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={userProfile.avatar_url || undefined} alt={userProfile.name || userProfile.email || "User"} />
                        <AvatarFallback>
                          {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : (userProfile.email ? userProfile.email.charAt(0).toUpperCase() : 'U')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col items-start truncate group-data-[state=collapsed]/sidebar-wrapper:hidden">
                        <span className="font-semibold text-sm text-foreground">{userProfile.name || 'Usuário'}</span>
                        <span className="text-xs text-muted-foreground truncate">{userProfile.email}</span>
                      </div>
                    </>
                  ) : (
                     <User className="w-5 h-5" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 mb-2" side="top" align="start">
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
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex-1 flex flex-col">
          <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 sticky top-0 z-10">
            <div className="flex items-center space-x-4">
              <SidebarTrigger />
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="icon" className="relative rounded-full">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-card"></span>
              </Button>
            </div>
          </header>

          <main className="p-6 flex-1 overflow-auto">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
