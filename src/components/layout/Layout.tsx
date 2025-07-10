import React, { useState, useEffect } from 'react';
import { AppSidebar } from "./Sidebar";
import { Button } from "@/components/ui/button";
import { Bell, Search, User, Menu } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Outlet } from 'react-router-dom';

export function Layout() {
  // Inicializa sidebarOpen com base na largura da tela
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024); // 1024px é o breakpoint 'lg'

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Efeito para ajustar sidebarOpen ao redimensionar a janela
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && !sidebarOpen) {
        setSidebarOpen(true); // Abre o sidebar se redimensionado para desktop e estiver fechado
      } else if (window.innerWidth < 1024 && sidebarOpen) {
        setSidebarOpen(false); // Fecha o sidebar se redimensionado para mobile e estiver aberto
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]); // Depende de sidebarOpen para reavaliar quando ele muda

  return (
    <div className="flex w-full bg-background"> 
      <AppSidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      
      <div className="flex-1 flex flex-col lg:ml-72"> {/* Adicionado lg:ml-72 para compensar a sidebar fixa */}
        {/* Top Header - Adicionado 'sticky top-0 z-10' para fixar o cabeçalho ao rolar a página */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="lg:hidden" // Botão de menu visível apenas em mobile
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div className="relative w-96 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                placeholder="Buscar questões, provas, materiais..." 
                className="pl-10 bg-muted/50 border-0 focus:bg-background"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
            </Button>
            <Button variant="ghost" size="icon">
              <User className="w-5 h-5" />
            </Button>
          </div>
        </header>

        {/* Main Content - Removido 'flex-1' e 'overflow-auto'. Adicionado 'p-6' para padding. */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
