import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Identical browser application, isolated output. Sites/Vinext remains unchanged.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: { outDir: 'dist-gcp/client', emptyOutDir: true, target: 'es2022' },
  worker: { format: 'es' },
});
