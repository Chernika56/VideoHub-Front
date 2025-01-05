<script setup>
import { authState } from '@/stores/auth.js'
import { RouterView } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import AppNav from '@/components/AppNav.vue'

const collectionNav = [
  { title: 'cameras', text: 'Камеры' },
  { title: 'star', text: 'Изображение' },
  { title: 'apps', text: 'Мозайки' },
  { title: 'explore', text: 'Карта' }
]

const collectionSettings = [
  { title: 'settings', text: 'Настройки' },
  { title: 'reports', text: 'Состояние' },
  { title: 'assignment', text: 'Журнал доступа' }
]

const collectionFooter = [
  { title: 'Powered by', text: 'Ya' },
  { title: 'Версия:', text: '0.1' },
  { title: '0.1', text: 'Адрес' },
  { title: 'phone', text: '123456789' },
  { title: 'access_time', text: '9:00-18:00' }
]
</script>

<template>
  <v-app>
    <AppHeader v-if="authState.isAuthenticated" />
    <AppNav v-if="authState.isAuthenticated" :collection-nav="collectionNav"
      :collection-settings="collectionSettings" />
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<style scoped>
</style>