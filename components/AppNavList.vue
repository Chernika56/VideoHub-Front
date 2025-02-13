<script setup>
import AppNavItem from '@/components/AppNavItem.vue'

defineProps({
  list: {
    type: Array,
    required: true
  }
})

</script>

<template>
  <ul>
    <AppNavItem v-for="item in list" :key="item" :item="item" />
  </ul>
</template>

<style scoped>
ul {
  padding: 0;
  margin: 0;
}
</style>
