// stores/useTitleStore.js
import { defineStore } from 'pinia';

export const useTitleStore = defineStore('titleStore', {
  state: () => ({
    title: 'Title'
  }),
  actions: {
    setTitle(newTitle) {
      this.title = newTitle;
    }
  }
});
