import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
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
    rollupOptions: {
      // Fix for Cloudflare Pages Rollup native module issue
      external: (id) => {
        return id.includes('@rollup/rollup-linux-x64-gnu');
      },
    },
    // Ensure compatibility with different environments
    target: 'es2020',
    minify: 'esbuild',
  },
});
