
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8080,
    host: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Garante que 'react' e 'react-dom' sempre resolvam para a mesma instância
      // Isso ajuda a evitar o erro "Cannot read properties of null (reading 'useRef')"
      'react': path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
    },
  },
  build: {
    target: 'es2020',
    minify: 'esbuild',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-accordion', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu']
        }
      }
    },
  },
  // Configurações específicas para Cloudflare Pages
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
    esbuildOptions: {
      target: 'es2020'
    }
  },
});
