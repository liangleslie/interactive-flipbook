import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        pageFlip: resolve(import.meta.dirname, 'page-flip/index.html'),
        sidescrollCards: resolve(import.meta.dirname, 'sidescroll-cards/index.html'),
        sidescrollPanorama: resolve(import.meta.dirname, 'sidescroll-panorama/index.html'),
        verticalStory: resolve(import.meta.dirname, 'vertical-story/index.html'),
        storyCards: resolve(import.meta.dirname, 'story-cards/index.html'),
      },
    },
  },
});
