import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { Layout } from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AnswerQuestionPage from './pages/AnswerQuestionPage';
import ResultsPage from './pages/ResultsPage';
import ProvasPage from './pages/ProvasPage';
import ListasPage from './pages/ListasPage';
import RankingPage from './pages/RankingPage';
import SettingsPage from './pages/SettingsPage'; // Importar a nova página
import CronogramaPage from './pages/CronogramaPage';
import OnboardingPage from './pages/OnboardingPage';
import ProfilePage from './pages/ProfilePage';
import OnboardingGuard from './components/OnboardingGuard';
import { Toaster } from '@/components/ui/toaster';
import { ComunidadePage } from './pages/ComunidadePage';

function AppRoutes() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-foreground">
        Carregando...
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      {session ? (
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="questoes/:listId" element={<AnswerQuestionPage />} /> 
          <Route path="resultados/:listId" element={<ResultsPage />} />
          <Route path="provas" element={<ProvasPage />} />
          <Route path="listas" element={<ListasPage />} />
          <Route path="comunidade" element={<ComunidadePage />} />
          <Route path="ranking" element={<RankingPage />} />
          <Route path="cronograma" element={<CronogramaPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} /> {/* Nova rota para Configurações */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      ) : (
        <Route path="*" element={<Navigate to="/login" replace />} />
      )}
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <OnboardingGuard>
          <AppRoutes />
          <Toaster />
        </OnboardingGuard>
      </AuthProvider>
    </Router>
  );
}

export default App;
