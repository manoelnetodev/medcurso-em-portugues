#!/usr/bin/env node

import { build } from 'esbuild';
import { glob } from 'glob';
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync, statSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { tailwindPlugin } from './esbuild-tailwind-plugin.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function buildForCloudflare() {
  console.log('🚀 Building for Cloudflare Pages with ESBuild (avoiding Rollup)...');
  
  // Log das variáveis que serão definidas
  console.log('🔧 Environment variables being defined:');
  console.log('   VITE_SUPABASE_URL: https://djdlbrurfmmhposfuwky.supabase.co');
  console.log('   VITE_SUPABASE_ANON_KEY: [DEFINED]');
  
  try {
    // Clean and create dist directory
    if (existsSync('dist')) {
      try {
        execSync('rm -rf dist', { stdio: 'pipe' });
      } catch (e) {
        try {
          // Fallback for Windows
          execSync('rmdir /s /q dist', { stdio: 'pipe', shell: true });
        } catch (e2) {
          // Manual cleanup if commands fail
          console.log('⚠️  Using manual cleanup...');
        }
      }
    }
    mkdirSync('dist', { recursive: true });
    mkdirSync('dist/assets', { recursive: true });
    
    // Copy public files
    if (existsSync('public')) {
      console.log('📂 Copying public files...');
      const publicFiles = glob.sync('public/**/*', { nodir: true });
      publicFiles.forEach(file => {
        const destFile = file.replace(/public[\\/]/, 'dist/').replace(/\\/g, '/');
        mkdirSync(dirname(destFile), { recursive: true });
        copyFileSync(file, destFile);
        console.log(`   Copied: ${file} → ${destFile}`);
      });
    }
    
    // Definições mais específicas das variáveis
    const defineVars = {
      'process.env.NODE_ENV': '"production"',
      'global': 'globalThis',
      'process.env': '{}',
      'process': 'undefined',
      __DEV__: 'false',
      // Garantir que as variáveis Supabase sejam definidas de múltiplas formas
      'import.meta.env.VITE_SUPABASE_URL': '"https://djdlbrurfmmhposfuwky.supabase.co"',
      'import.meta.env.VITE_SUPABASE_ANON_KEY': '"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqZGxicnVyZm1taHBvc2Z1d2t5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3Nzg0NjcsImV4cCI6MjA1ODM1NDQ2N30.kTqGtVzFhIQ89kEwug12LB1XihnBCCWee3iGSJy5uHU"',
      'import.meta.env.DEV': 'false',
      'import.meta.env.PROD': 'true',
      'import.meta.env.MODE': '"production"',
      // Alternativas para casos específicos
      'process.env.VITE_SUPABASE_URL': '"https://djdlbrurfmmhposfuwky.supabase.co"',
      'process.env.VITE_SUPABASE_ANON_KEY': '"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqZGxicnVyZm1taHBvc2Z1d2t5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3Nzg0NjcsImV4cCI6MjA1ODM1NDQ2N30.kTqGtVzFhIQ89kEwug12LB1XihnBCCWee3iGSJy5uHU"',
    };
    
    console.log('📦 Building main application...');
    console.log('🔍 Define variables:', Object.keys(defineVars).length, 'variables');
    
    // Build the main application bundle
    const result = await build({
      entryPoints: ['src/main.tsx'],
      bundle: true,
      outfile: 'dist/assets/index.js',
      format: 'esm',
      target: 'es2020',
      minify: true,
      sourcemap: false,
      jsx: 'automatic',
      jsxDev: false,
      treeShaking: true,
      splitting: false,
      loader: {
        '.tsx': 'tsx',
        '.ts': 'ts',
        '.jsx': 'jsx',
        '.js': 'js',
        '.css': 'css',
        '.svg': 'dataurl',
        '.png': 'dataurl',
        '.jpg': 'dataurl',
        '.jpeg': 'dataurl',
        '.gif': 'dataurl',
        '.webp': 'dataurl',
        '.woff': 'dataurl',
        '.woff2': 'dataurl',
        '.ttf': 'dataurl',
        '.eot': 'dataurl'
      },
      define: defineVars,
      alias: {
        '@': resolve(__dirname, 'src')
      },
      external: [],
      metafile: true,
      write: true,
      logLevel: 'info',
      resolveExtensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
      conditions: ['import', 'module', 'browser', 'default'],
      mainFields: ['browser', 'module', 'main'],
      platform: 'browser'
    });
    
    // Build CSS with Tailwind processing
    console.log('🎨 Building CSS with Tailwind...');
    await build({
      entryPoints: ['src/index.css'],
      bundle: true,
      outfile: 'dist/assets/index.css',
      minify: true,
      sourcemap: false,
      plugins: [tailwindPlugin()],
      loader: {
        '.css': 'css'
      },
      external: [],
      logLevel: 'info'
    });
    
    // Generate HTML file with additional debug
    console.log('📄 Generating HTML...');
    const indexHtml = readFileSync('index.html', 'utf8');
    
    // Get the actual output file names (with hashes if any)
    const jsFiles = glob.sync('dist/assets/*.js');
    const cssFiles = glob.sync('dist/assets/*.css');
    
    const jsFile = jsFiles[0] ? jsFiles[0].replace(/dist[\\/]/, '/').replace(/\\/g, '/') : '/assets/index.js';
    const cssFile = cssFiles[0] ? cssFiles[0].replace(/dist[\\/]/, '/').replace(/\\/g, '/') : '/assets/index.css';
    
    let processedHtml = indexHtml
      .replace('/src/main.tsx', jsFile)
      .replace('</head>', `  <link rel="stylesheet" href="${cssFile}">
  <script>
    // Debugging: verificar se as variáveis estão disponíveis
    console.log('🔍 DEBUG: Verificando variáveis de ambiente...');
    console.log('VITE_SUPABASE_URL:', typeof window !== 'undefined' ? 'window context' : 'server context');
    
    // Global error handlers
    window.addEventListener('error', function(e) {
      console.error('❌ Global error:', e.error);
      console.error('📍 Stack:', e.error?.stack);
      console.error('📁 Filename:', e.filename);
      console.error('📏 Line:', e.lineno);
    });
    
    window.addEventListener('unhandledrejection', function(e) {
      console.error('❌ Unhandled promise rejection:', e.reason);
      console.error('📍 Promise:', e.promise);
    });
    
    // Loading debug
    console.log('✅ HTML loaded, waiting for React...');
    
    // Timer para detectar se o carregamento trava
    setTimeout(function() {
      if (!window.ReactLoaded) {
        console.error('⚠️ React não carregou em 10 segundos!');
      }
    }, 10000);
  </script>
</head>`)
      .replace('<script type="module"', '<script type="module" crossorigin')
      .replace('<div id="root"></div>', `<div id="root">
    <div style="display: flex; align-items: center; justify-content: center; height: 100vh; background: #0a0a0a; color: #fff; font-family: system-ui, sans-serif;">
      <div style="text-align: center;">
        <div style="width: 40px; height: 40px; border: 3px solid #333; border-top: 3px solid #e50e5f; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 16px;"></div>
        <p>Carregando UltraMeds...</p>
        <p style="font-size: 12px; color: #666; margin-top: 8px;">Se esta tela persistir, verifique o console</p>
      </div>
    </div>
    <style>
      @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
  </div>`);
    
    writeFileSync('dist/index.html', processedHtml);
    
    console.log('✅ Build completed successfully!');
    console.log('📊 Build stats:');
    console.log(`   JavaScript: ${jsFile}`);
    console.log(`   CSS: ${cssFile}`);
    
    // Debug: verificar tamanhos dos arquivos
    const jsStats = statSync('dist/assets/index.js');
    const cssStats = statSync('dist/assets/index.css');
    console.log(`📏 File sizes:`);
    console.log(`   JS: ${(jsStats.size / 1024).toFixed(1)}KB`);
    console.log(`   CSS: ${(cssStats.size / 1024).toFixed(1)}KB`);
    
    // Verificar se as variáveis foram mesmo substituídas
    console.log('🔍 Checking if environment variables were replaced...');
    
  } catch (error) {
    console.error('❌ Build failed:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

buildForCloudflare(); 