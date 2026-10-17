import { defineConfig } from 'vite';
export default defineConfig({
  publicDir: false,
  ssr: { noExternal: ['zod'] },
  build: {
    ssr: 'server/gcp/entry.ts',
    outDir: 'dist-gcp',
    emptyOutDir: false,
    target: 'node22',
    rollupOptions: { output: { entryFileNames: 'server.mjs' } },
  },
});
