/**
 * Tiny event emitter to replace the Vue 2 event bus pattern ($emit / $on / $off).
 * In Vue 3, Vue instances no longer expose $on/$off; use this instead.
 */
class EventEmitter {
  constructor() {
    this._events = {};
  }

  on(event, listener) {
    if (!this._events[event]) {
      this._events[event] = [];
    }
    this._events[event].push(listener);
    return this;
  }

  off(event, listener) {
    if (!this._events[event]) return this;
    if (listener) {
      this._events[event] = this._events[event].filter(l => l !== listener);
    } else {
      delete this._events[event];
    }
    return this;
  }

  $emit(event, ...args) {
    (this._events[event] || []).forEach(listener => listener(...args));
    return this;
  }

  $on(event, listener) {
    return this.on(event, listener);
  }

  $off(event, listener) {
    return this.off(event, listener);
  }
}

export default EventEmitter;
