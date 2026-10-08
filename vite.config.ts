/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// `npm run build`        -> dist/         (standard static build, host anywhere)
// `npm run build:single` -> dist-single/  (one self-contained index.html that opens by double-click)
export default defineConfig(({ mode }) => {
  const single = mode === 'single';
  return {
    base: './',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    build: single
      ? {
          // One script, one stylesheet, fonts inlined; scripts/inline-single.mjs then merges them.
          outDir: 'dist-single',
          assetsInlineLimit: 100_000_000,
          cssCodeSplit: false,
          chunkSizeWarningLimit: 5000,
          rollupOptions: { output: { inlineDynamicImports: true } },
        }
      : { chunkSizeWarningLimit: 1500 },
    test: { environment: 'node', include: ['src/**/*.test.ts'] },
  };
});
