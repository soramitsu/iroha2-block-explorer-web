import '@/shared/ui/fonts/sora/index.css';
import '@/shared/ui/fonts/jet-brains-mono/index.css';

import { createApp } from 'vue';

import App from './App.vue';
import router from './router';
import { i18n } from '@/shared/lib/localization';

const app = createApp(App);

app.use(router);
app.use(i18n);

app.mount('#app');
