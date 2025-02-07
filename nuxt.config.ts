export default defineNuxtConfig({
  app: {
    head: {
      title: 'Nuxt 3 Phantom Wallet',
      meta: [
        {
          name: 'description',
          content: 'Nuxt 3 project with Phantom Wallet'
        }
      ],
    },
  },

  // Global styles
  css: ['@/assets/styles/main.css'],

  // Compatibility date
  compatibilityDate: '2025-02-06',

  // Register the Buffer polyfill plugin for client side
  plugins: [
    { src: '~/plugins/buffer.client.js', mode: 'client' }
  ],

  // Vite configuration for buffer polyfill
  vite: {
    define: {
      'process.env': {}, // Polyfill for process.env in browser
      global: 'window'   // Map global to window for browser compatibility
    },
    resolve: {
      alias: {
        buffer: 'buffer', // Alias for the buffer package
      },
    },
  },
})
