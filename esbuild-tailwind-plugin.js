import { readFileSync } from 'fs';
import { resolve } from 'path';
import { execSync } from 'child_process';

export function tailwindPlugin() {
  return {
    name: 'tailwind',
    setup(build) {
      build.onLoad({ filter: /\.css$/ }, async (args) => {
        try {
          // Process CSS with Tailwind using PostCSS
          const cssContent = readFileSync(args.path, 'utf8');
          
          // Run Tailwind processing
          const result = execSync(
            `npx tailwindcss -i ${args.path} --content "src/**/*.{js,ts,jsx,tsx}" --minify`,
            { encoding: 'utf8', stdio: 'pipe' }
          );
          
          return {
            contents: result,
            loader: 'css'
          };
        } catch (error) {
          // Fallback to original CSS if Tailwind processing fails
          console.warn('Tailwind processing failed, using original CSS:', error.message);
          const cssContent = readFileSync(args.path, 'utf8');
          return {
            contents: cssContent,
            loader: 'css'
          };
        }
      });
    }
  };
} 