import Clipboard from 'clipboard';
import timeSvc from '../../services/timeSvc';
import store from '../../store';

export default (app) => {
  // v-focus: focus an element on mount and select its content if any
  app.directive('focus', {
    mounted(el) {
      el.focus();
      const { value } = el;
      if (value && el.setSelectionRange) {
        el.setSelectionRange(0, value.length);
      }
    },
  });

  // v-title: set title and aria-label on element
  const setElTitle = (el, title) => {
    el.title = title;
    el.setAttribute('aria-label', title);
  };
  app.directive('title', {
    beforeMount(el, { value }) {
      setElTitle(el, value);
    },
    updated(el, { value, oldValue }) {
      if (value !== oldValue) {
        setElTitle(el, value);
      }
    },
  });

  // v-clipboard: attach clipboard.js to element
  const createClipboard = (el, value) => {
    el.seClipboard = new Clipboard(el, { text: () => value });
  };
  const destroyClipboard = (el) => {
    if (el.seClipboard) {
      el.seClipboard.destroy();
      el.seClipboard = null;
    }
  };
  app.directive('clipboard', {
    beforeMount(el, { value }) {
      createClipboard(el, value);
    },
    updated(el, { value, oldValue }) {
      if (value !== oldValue) {
        destroyClipboard(el);
        createClipboard(el, value);
      }
    },
    unmounted(el) {
      destroyClipboard(el);
    },
  });

  // Global property: $formatTime (replaces Vue 2 filter)
  app.config.globalProperties.$formatTime = time =>
    // Access the time counter for reactive refresh
    timeSvc.format(time, store.state.timeCounter);
};
