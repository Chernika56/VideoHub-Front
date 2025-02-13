<script setup>

definePageMeta({
  title: 'Главная',
})

const route = useRoute()
</script>

<template>
  <div>
    <h1>Nuxt Routing set up successfully!</h1>
    <p>Current route: {{ route.path }}</p>
    <a href="https://nuxt.com/docs/getting-started/routing" target="_blank">Learn more about Nuxt Routing</a>
  </div>
</template>

<style scoped>
div {
  left: 170px;
  position: fixed;
  top: 42px;
  bottom: 0;
  right: 0;
  overflow: auto;
  overflow-x: hidden;
  padding: 20px;
  position: relative;
  min-height: 100%;
  background-color: var(--backgroundColorMain, #f3f5f7);
}
</style>
