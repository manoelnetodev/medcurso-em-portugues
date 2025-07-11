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
    
    // Build the main application bundle
    console.log('📦 Building main application...');
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
      define: {
        'process.env.NODE_ENV': '"production"',
        'global': 'globalThis',
        'process.env': '{}',
        'process': 'undefined',
        __DEV__: 'false'
      },
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
    
    // Generate HTML file
    console.log('📄 Generating HTML...');
    const indexHtml = readFileSync('index.html', 'utf8');
    
    // Get the actual output file names (with hashes if any)
    const jsFiles = glob.sync('dist/assets/*.js');
    const cssFiles = glob.sync('dist/assets/*.css');
    
    const jsFile = jsFiles[0] ? jsFiles[0].replace(/dist[\\/]/, '/').replace(/\\/g, '/') : '/assets/index.js';
    const cssFile = cssFiles[0] ? cssFiles[0].replace(/dist[\\/]/, '/').replace(/\\/g, '/') : '/assets/index.css';
    
    let processedHtml = indexHtml
      .replace('/src/main.tsx', jsFile)
      .replace('</head>', `  <link rel="stylesheet" href="${cssFile}">\n</head>`)
      .replace('<script type="module"', '<script type="module" crossorigin');
    
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
    
  } catch (error) {
    console.error('❌ Build failed:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

buildForCloudflare(); 