<script setup>

definePageMeta({
  title: 'Главная',
})

const router = useRouter()

onMounted(() => {
  router.push('/cameras')
})
</script>

<template>
  <div><h1>Перенаправление...</h1></div>
  <!-- <div>
    <h1>Nuxt Routing set up successfully!</h1>
    <p>Current route: {{ route.path }}</p>
    <a href="https://nuxt.com/docs/getting-started/routing" target="_blank">Learn more about Nuxt Routing</a>
  </div> -->
</template>

<style scoped>
div {
  left: 170px;
  top: 42px;
  overflow: auto;
  overflow-x: hidden;
  padding: 20px;
  position: relative;
  background-color: var(--backgroundColorMain, #f3f5f7);
}
</style>
