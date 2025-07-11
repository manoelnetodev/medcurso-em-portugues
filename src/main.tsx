
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

console.log('🚀 Iniciando aplicação...');

// Debug das variáveis de ambiente
console.log('🔍 Environment variables check:');
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_ANON_KEY presente:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error('Root element not found');
}

console.log('✅ Root element encontrado, renderizando App...');

const root = createRoot(rootElement);
root.render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);

console.log('✅ App renderizada com sucesso!');

// Indicar que o React carregou
(window as any).ReactLoaded = true;
console.log('🎯 React totalmente carregado!');
