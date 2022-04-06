import '@soramitsu-ui/theme/fonts/Sora';
// import '@soramitsu-ui/theme/src/fonts/JetBrainsMono';

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

const app = createApp(App);

app.use(router);
app.mount('#app');
