import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { SidebarModern } from './SidebarModern';
import { HeaderModern } from './HeaderModern';

export function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true); // Iniciar collapsed no mobile
  const location = useLocation();
  
  // Detectar se estamos na página de responder questões
  const isQuestionPage = location.pathname.startsWith('/questoes/');

  // Layout especial para página de questões (sem header/sidebar)
  if (isQuestionPage) {
    return (
      <div className="min-h-screen bg-background">
        <main className="min-h-screen">
          <Outlet />
        </main>
      </div>
    );
  }

  // Layout padrão para outras páginas
  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed inset-y-0 left-0 z-50">
        <SidebarModern collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      </div>
      
      {/* Mobile Sidebar Overlay */}
      {!sidebarCollapsed && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setSidebarCollapsed(true)}>
          <div className="fixed inset-y-0 left-0 w-64">
            <SidebarModern collapsed={false} setCollapsed={setSidebarCollapsed} />
          </div>
        </div>
      )}
      
      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ${
          sidebarCollapsed ? 'lg:ml-[70px]' : 'lg:ml-64'
        }`}
      >
        <HeaderModern onMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main className="flex-1 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 py-6 max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
