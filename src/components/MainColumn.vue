<script setup>
import { useRoute } from 'vue-router'
import { ref, watch } from 'vue'

const route = useRoute()

const title = ref(route.meta.title || "Title")

watch(() => route.meta.title, (newTitle) => {
  title.value = newTitle || "Title"
})
</script>

<template>
  <div class="mainColumn">
    <h1 class="title">{{ title }}</h1>
  </div>
</template>

<style scoped>
.mainColumn {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  padding: 0 10px;
  color: var(--textHeaderColor, #8a8a8a);
}

.title {
  color: var(--textHeaderColorAccent, #f1f1f1);
  font-size: 17px;
  font-weight: 300;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 10px;
  min-width: 0;
  flex-shrink: 2;
}

.title:hover,
.title:active,
.title:focus {
  color: var(--textHeaderColorAccent, #f1f1f1);
  text-decoration: none;
}
</style>
