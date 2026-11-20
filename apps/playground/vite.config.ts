import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  // Local builds use relative assets. The Pages workflow sets
  // PLAYGROUND_BASE=/pixelvale-ui/ so deep links and the 404 fallback resolve
  // every asset from the project site instead of the domain root.
  base: process.env.PLAYGROUND_BASE ?? './',
  resolve: {
    alias: {
      '@pixelvale/ui': fileURLToPath(
        new URL('../../packages/ui/src/index.ts', import.meta.url),
      ),
    },
  },
  server: {
    port: 5173,
    fs: {
      allow: [fileURLToPath(new URL('../..', import.meta.url))],
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
