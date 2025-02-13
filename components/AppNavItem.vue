<script setup>

defineProps({
  item: {
    type: Array,
    required: true
  }
})
</script>

<template>
  <li>
    <nuxt-link :to="'/' + item.title" class="menuItemLink">
      <img src="public\camera.png" alt="Alternate Text" />
      <span class="menuItemText">{{ item.text }}</span>
    </nuxt-link>
  </li>
</template>

<style scoped>
li {
  font-size: 13px;
  list-style: none;
}

img {
  margin-right: 16px;

  font-size: 24px;
  width: 24px;
  text-align: center;
  height: 24px;

  font-family: 'Material Icons';
  font-weight: normal;
  font-style: normal;
  font-size: 24px;
  display: inline-block;
  line-height: 1;
  text-transform: none;
  letter-spacing: normal;
  word-wrap: normal;
  white-space: nowrap;
  direction: ltr;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  -moz-osx-font-smoothing: grayscale;
  font-feature-settings: 'liga';
}

.menuItemLink {
  display: flex;
  padding: 8px 13px;
  overflow: hidden;
  align-items: center;
  color: var(--textPrimaryColor, #8a8a8a) !important;
  background-color: transparent;
  border: none;
  width: 100%;
  text-align: left;
  transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
}

.menuItemLink:hover,
.menuItemLink:focus {
  text-decoration: none;
  color: var(--textPrimaryColorAccent, #f1f1f1);
  background-color: var(--primaryColorMedium, #34383e);
  outline: none;
}
</style>
