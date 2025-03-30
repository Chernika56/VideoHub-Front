<script setup>
const authStore = useAuthStore();

await authStore.whoami();

if (authStore.authenticated) {
  navigateTo('/')
}
</script>

<template>
  <main>
    <slot></slot>
  </main>
</template>

<style scoped></style>