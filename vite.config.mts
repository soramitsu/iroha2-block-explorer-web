/// <reference types="vitest" />
import { defineConfig } from 'vite';
import path from 'path';
import vue from '@vitejs/plugin-vue';
import svg from 'vite-svg-loader';

// https://vitejs.dev/config/
export default defineConfig({
  define:{
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false
  },
  server: {
    proxy: {
      '/api/v1': 'http://127.0.0.1:4000',
    },
  },
  test: {
    environment: 'jsdom',
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
  ],
  resolve: {
    alias: {
      '@/': `${path.resolve(__dirname, 'src')}/`,
    },
  },
});
