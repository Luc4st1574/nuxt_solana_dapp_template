export default defineNuxtConfig({
  app: {
    head: {
      title: 'Nuxt 3 Phantom Wallet',
      meta: [{ name: 'description', content: 'Nuxt 3 project with Phantom Wallet' }],
    },
  },

  // Optional if using global styles
  css: ['@/assets/styles/main.css'],

  compatibilityDate: '2025-02-06'
})