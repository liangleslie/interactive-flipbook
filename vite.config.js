import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        singlePageFlip: resolve(import.meta.dirname, 'single-page-flip/index.html'),
        sidescroll: resolve(import.meta.dirname, 'sidescroll/index.html'),
        verticalStory: resolve(import.meta.dirname, 'vertical-story/index.html'),
        storyCards: resolve(import.meta.dirname, 'story-cards/index.html'),
      },
    },
  },
});
