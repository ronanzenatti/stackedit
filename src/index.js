import { createApp } from 'vue';
import 'babel-polyfill';
import 'indexeddbshim/dist/indexeddbshim';

import './extensions';
import './services/optional';
import setupIcons from './icons';
import App from './components/App.vue';
import store from './store';
import localDbSvc from './services/localDbSvc';
import setupGlobals from './components/common/vueGlobals';

if (!indexedDB) {
  throw new Error('Your browser is not supported. Please upgrade to the latest version.');
}



if (localStorage.updated) {
  store.dispatch('notification/info', 'StackEdit has just updated itself!');
  setTimeout(() => localStorage.removeItem('updated'), 2000);
}

if (!localStorage.installPrompted) {
  window.addEventListener('beforeinstallprompt', async (promptEvent) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    promptEvent.preventDefault();

    try {
      await store.dispatch('notification/confirm', 'Add StackEdit to your home screen?');
      promptEvent.prompt();
      await promptEvent.userChoice;
    } catch (err) {
      // Cancel
    }
    localStorage.installPrompted = true;
  });
}

// Vue.config.productionTip = false; // not needed in vue 3

/* eslint-disable no-new */
const app = createApp(App);
setupGlobals(app);
setupIcons(app);
app.use(store);
app.mount('#app');
