import '@/core/assets/fonts/sora/index.css';
import '@/core/assets/fonts/jet-brains-mono/index.css';

import { createApp } from 'vue';

import App from './App.vue';
import router from './router/router';
import { createPinia } from 'pinia';
import { setupI18n } from '@/i18n';
import { messages } from '@/i18n/messages';

const i18n = setupI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages,
});

const app = createApp(App);

app.use(router);
app.use(i18n);
app.use(createPinia());

app.mount('#app');
