import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  BookOpen, 
  FileText, 
  List, 
  Brain, 
  Clock, 
  Award, 
  Settings, 
  User, 
  LogOut, 
  Menu, 
  X,
  Search,
  Plus,
  Bell,
  Stethoscope
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from '@/hooks/useAuth';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";

interface MobileNavProps {
  children?: React.ReactNode;
}

export function MobileNav({ children }: MobileNavProps) {
  const { userProfile, signOut, loading } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const navItems = [
    { 
      name: 'Dashboard', 
      icon: Home, 
      path: '/dashboard',
      description: 'Visão geral'
    },
    { 
      name: 'Questões', 
      icon: BookOpen, 
      path: '/questoes',
      description: 'Pratique questões'
    },
    { 
      name: 'Provas', 
      icon: FileText, 
      path: '/provas', 
      badge: '3',
      description: 'Simulados'
    },
    { 
      name: 'Listas', 
      icon: List, 
      path: '/listas',
      description: 'Exercícios'
    },
    { 
      name: 'Flashcards', 
      icon: Brain, 
      path: '/flashcards',
      description: 'Estude'
    },
    { 
      name: 'Cronograma', 
      icon: Clock, 
      path: '/cronograma',
      description: 'Organize'
    },
    { 
      name: 'Ranking', 
      icon: Award, 
      path: '/ranking',
      description: 'Compare'
    },
  ];

  const projectItems = [
    { name: 'Cardiologia Avançada', color: 'bg-red-500', progress: 75 },
    { name: 'Neurologia Pediátrica', color: 'bg-blue-500', progress: 45 },
    { name: 'Casos Clínicos 2025', color: 'bg-green-500', progress: 90 },
  ];

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  const handleNavClick = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg">
              <Stethoscope className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">UltraMeds</h1>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-background animate-pulse"></span>
            </Button>
            
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <SheetHeader className="p-4 border-b border-border/50">
                  <SheetTitle className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl">
                      <Stethoscope className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold">UltraMeds</h2>
                      <p className="text-xs text-muted-foreground">Residência Médica</p>
                    </div>
                  </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto">
                  {/* Search */}
                  <div className="p-4 border-b border-border/50">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Buscar..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-muted/50 border-0 focus:bg-background"
                      />
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="p-4 space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Navegação
                      </h3>
                      <div className="space-y-1">
                        {navItems.map((item) => {
                          const Icon = item.icon;
                          const isActive = location.pathname === item.path;
                          
                          return (
                            <Link
                              key={item.name}
                              to={item.path}
                              onClick={handleNavClick}
                              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                isActive
                                  ? "bg-primary text-primary-foreground shadow-sm"
                                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                              }`}
                            >
                              <Icon className="w-5 h-5 flex-shrink-0" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span>{item.name}</span>
                                  {item.badge && (
                                    <Badge variant="secondary" className="text-xs">
                                      {item.badge}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs opacity-75">{item.description}</p>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>

                    {/* Projects */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Projetos Ativos
                        </h3>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-1">
                        {projectItems.map((item) => (
                          <div
                            key={item.name}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                          >
                            <div className="relative">
                              <span className={`h-3 w-3 ${item.color} rounded-full`} />
                              <div className="absolute inset-0 rounded-full bg-muted-foreground/20 animate-pulse" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{item.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full ${item.color.replace('bg-', 'bg-')} rounded-full transition-all duration-300`}
                                    style={{ width: `${item.progress}%` }}
                                  />
                                </div>
                                <span className="text-xs text-muted-foreground">{item.progress}%</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border/50">
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={userProfile?.avatar_url || ''} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                        {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : (userProfile?.email ? userProfile.email.charAt(0).toUpperCase() : 'U')}
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
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Configurações</DropdownMenuLabel>
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
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Content */}
      {children}
    </>
  );
} 