export default defineNuxtConfig({
  app: {
    head: {
      title: 'Nuxt 3 Phantom Wallet',
      meta: [{ name: 'description', content: 'Nuxt 3 project with Phantom Wallet' }],
    },
  },

  // Global styles
  css: ['@/assets/styles/main.css'],

  // Compatibility date
  compatibilityDate: '2025-02-06',

  // Vite configuration for buffer polyfill
  vite: {
    define: {
      'process.env': {}, // Polyfill for process.env in browser
    },
    resolve: {
      alias: {
        buffer: 'buffer', // Polyfill for Buffer
      },
    },
  },
});