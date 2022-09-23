import '~shared/ui/fonts/sora/index.css';
import '~shared/ui/fonts/jet-brains-mono/index.css';

import { createApp } from 'vue';

import App from './App.vue';
import { i18n } from '~shared/lib/localization';
import router from './router';

const app = createApp(App);

app.use(router);
app.use(i18n);

router.isReady().then(() => app.mount('#app'));
