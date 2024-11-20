<script setup>
import AppNavList from '@/components/AppNavList.vue'

defineProps({
  collectionNav: {
    type: Array,
    required: true
  },
  collectionSettings: {
    type: Array,
    required: true
  }
})
</script>

<template>
  <nav>
    <AppNavList :list="collectionNav" style="flex: 1 1 auto" />
    <AppNavList :list="collectionSettings" />
  </nav>
</template>

<style scoped>
nav {
  width: 170px;
  left: 0;
  top: 42px;
  bottom: 0;
  position: fixed;
  border-radius: 0;
  background-color: var(--primaryColorMain, #444951);
  color: #fff;
  display: flex;
  flex-direction: column;
  overflow: auto;
}
</style>