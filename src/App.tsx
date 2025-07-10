
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import AuthPage from "./components/auth/AuthPage";
import Dashboard from "./components/dashboard/Dashboard";
import QuestoesPage from "./components/questoes/QuestoesPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/auth" replace />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
          <Route path="/questoes" element={<Layout><QuestoesPage /></Layout>} />
          <Route path="/provas" element={<Layout><div className="p-6"><h1 className="text-2xl font-bold">Provas</h1><p className="text-muted-foreground">Em desenvolvimento...</p></div></Layout>} />
          <Route path="/listas" element={<Layout><div className="p-6"><h1 className="text-2xl font-bold">Listas</h1><p className="text-muted-foreground">Em desenvolvimento...</p></div></Layout>} />
          <Route path="/flashcards" element={<Layout><div className="p-6"><h1 className="text-2xl font-bold">Flashcards</h1><p className="text-muted-foreground">Em desenvolvimento...</p></div></Layout>} />
          <Route path="/cronograma" element={<Layout><div className="p-6"><h1 className="text-2xl font-bold">Cronograma</h1><p className="text-muted-foreground">Em desenvolvimento...</p></div></Layout>} />
          <Route path="/materiais" element={<Layout><div className="p-6"><h1 className="text-2xl font-bold">Materiais</h1><p className="text-muted-foreground">Em desenvolvimento...</p></div></Layout>} />
          <Route path="/relatorios" element={<Layout><div className="p-6"><h1 className="text-2xl font-bold">Relatórios</h1><p className="text-muted-foreground">Em desenvolvimento...</p></div></Layout>} />
          <Route path="/ranking" element={<Layout><div className="p-6"><h1 className="text-2xl font-bold">Ranking</h1><p className="text-muted-foreground">Em desenvolvimento...</p></div></Layout>} />
          <Route path="/perfil" element={<Layout><div className="p-6"><h1 className="text-2xl font-bold">Perfil</h1><p className="text-muted-foreground">Em desenvolvimento...</p></div></Layout>} />
          <Route path="/configuracoes" element={<Layout><div className="p-6"><h1 className="text-2xl font-bold">Configurações</h1><p className="text-muted-foreground">Em desenvolvimento...</p></div></Layout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
