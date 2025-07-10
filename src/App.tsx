
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import AuthPage from "./components/auth/AuthPage";
import Dashboard from "./components/dashboard/Dashboard";
import QuestoesPage from "./components/questoes/QuestoesPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/auth" replace />} />
      <Route path="/auth" element={user ? <Navigate to="/dashboard" replace /> : <AuthPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
      <Route path="/questoes" element={<ProtectedRoute><Layout><QuestoesPage /></Layout></ProtectedRoute>} />
      <Route path="/provas" element={<ProtectedRoute><Layout><div className="p-6"><h1 className="text-2xl font-bold">Provas</h1><p className="text-muted-foreground">Em desenvolvimento...</p></div></Layout></ProtectedRoute>} />
      <Route path="/listas" element={<ProtectedRoute><Layout><div className="p-6"><h1 className="text-2xl font-bold">Listas</h1><p className="text-muted-foreground">Em desenvolvimento...</p></div></Layout></ProtectedRoute>} />
      <Route path="/flashcards" element={<ProtectedRoute><Layout><div className="p-6"><h1 className="text-2xl font-bold">Flashcards</h1><p className="text-muted-foreground">Em desenvolvimento...</p></div></Layout></ProtectedRoute>} />
      <Route path="/cronograma" element={<ProtectedRoute><Layout><div className="p-6"><h1 className="text-2xl font-bold">Cronograma</h1><p className="text-muted-foreground">Em desenvolvimento...</p></div></Layout></ProtectedRoute>} />
      <Route path="/materiais" element={<ProtectedRoute><Layout><div className="p-6"><h1 className="text-2xl font-bold">Materiais</h1><p className="text-muted-foreground">Em desenvolvimento...</p></div></Layout></ProtectedRoute>} />
      <Route path="/relatorios" element={<ProtectedRoute><Layout><div className="p-6"><h1 className="text-2xl font-bold">Relatórios</h1><p className="text-muted-foreground">Em desenvolvimento...</p></div></Layout></ProtectedRoute>} />
      <Route path="/ranking" element={<ProtectedRoute><Layout><div className="p-6"><h1 className="text-2xl font-bold">Ranking</h1><p className="text-muted-foreground">Em desenvolvimento...</p></div></Layout></ProtectedRoute>} />
      <Route path="/perfil" element={<ProtectedRoute><Layout><div className="p-6"><h1 className="text-2xl font-bold">Perfil</h1><p className="text-muted-foreground">Em desenvolvimento...</p></div></Layout></ProtectedRoute>} />
      <Route path="/configuracoes" element={<ProtectedRoute><Layout><div className="p-6"><h1 className="text-2xl font-bold">Configurações</h1><p className="text-muted-foreground">Em desenvolvimento...</p></div></Layout></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
