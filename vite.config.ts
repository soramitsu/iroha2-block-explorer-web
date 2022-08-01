import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import svg from 'vite-svg-loader';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    target: 'esnext',
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
    alias: [
      { find: 'styles', replacement: resolve(__dirname, './src/shared/ui/styles/main.scss') },
      { find: '~app', replacement: resolve(__dirname, './src/app') },
      { find: '~pages', replacement: resolve(__dirname, './src/pages') },
      { find: '~widgets', replacement: resolve(__dirname, './src/widgets') },
      { find: '~features', replacement: resolve(__dirname, './src/features') },
      { find: '~entities', replacement: resolve(__dirname, './src/entities') },
      { find: '~shared', replacement: resolve(__dirname, './src/shared') },
      { find: '~base', replacement: resolve(__dirname, './src/shared/ui/components') },
      { find: '~icons', replacement: resolve(__dirname, './src/shared/ui/icons') },
    ],
  },
});
