import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import svg from 'vite-svg-loader';
import { resolve } from 'path';

function mapAlias([alias, path]: [string, string]) {
  return { find: alias, replacement: resolve(__dirname, 'src', path) };
}

const aliases = [
  ['styles', 'shared/ui/styles/main.scss'],
  ['~app', 'app'],
  ['~pages', 'pages'],
  ['~widgets', 'widgets'],
  ['~features', 'features'],
  ['~entities', 'entities'],
  ['~shared', 'shared'],
  ['~base', 'shared/ui/components'],
  ['~icons', 'shared/ui/icons'],
];

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
    alias: aliases.map(mapAlias),
  },
});
