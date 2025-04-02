// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  css: [
    'vuetify/styles',
    '@/assets/base.css',
    '@/assets/main.css',
  ],
  modules: ['@pinia/nuxt'],
  build: {
    transpile: ["vuetify"],
  },
  runtimeConfig: {
    public: {
      API_BASE_URL: process.env.API_BASE_URL || ''
    }
  }
})