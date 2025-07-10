import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { Layout } from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AnswerQuestionPage from './pages/AnswerQuestionPage'; // Changed back to default import
import ProvasPage from './pages/ProvasPage';
import ListasPage from './pages/ListasPage';

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
      {session ? (
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          {/* Rota para responder questões, aceitando listId como parâmetro */}
          <Route path="questoes/:listId" element={<AnswerQuestionPage />} /> 
          <Route path="provas" element={<ProvasPage />} />
          <Route path="listas" element={<ListasPage />} />
          {/* Adicione outras rotas protegidas aqui */}
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
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
