/// <reference types="vitest" />
import { defineConfig } from 'vite';
import path from 'path';
import vue from '@vitejs/plugin-vue';
import svg from 'vite-svg-loader';
import wasm from "vite-plugin-wasm";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/api/v1': 'http://127.0.0.1:4000',
    },
  },
  test: {
    environment: 'jsdom',
    globalSetup: 'test-globals.ts',
  },
  build: {
    target: 'esnext',
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext',
    },
  },
  plugins: [
    vue(),
    svg({
      svgoConfig: {
        plugins: [{ name: 'removeViewBox', active: false }],
      },
    }),
      wasm()
  ],
  resolve: {
    alias: {
      '@/': `${path.resolve(__dirname, 'src')}/`,
    },
  },
});
