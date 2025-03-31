<template>
  <NuxtLayout>
    <NuxtLoadingIndicator />

    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
const authStore = useAuthStore();
await authStore.whoami();
</script>