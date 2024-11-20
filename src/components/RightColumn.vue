<script setup>

defineProps({
  language: {
      type: String,
      required: true
    },
    person: {
      type: String,
      required: true
    },
})
</script>

<template>
  <div class="rightColumn">
    <button type="button" class="languageButton">
      {{ language }}
      <!--<i>arrow_drop_down</i>-->
    </button>
    <button type="button" class="profileButton">
      <!--<i>person</i>-->
      {{ person }}
    </button>
  </div>
</template>

<style scoped>
.rightColumn {
  max-width: 250px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.languageButton {
  font-size: 13px;
  line-height: 16px;
  border-radius: 4px;
  background-color: transparent;
  color: var(--textHeaderColorTransparent, rgba(255, 255, 255, 0.3)) !important;
  padding: 3px 8px !important;
  border: none;
  text-transform: uppercase;
  text-align: center;
  font-size: 13px;
  font-weight: 500;
  outline: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-family: inherit;
  text-decoration: none;
  position: relative;
  white-space: nowrap;
  transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms
}

.profileButton {
  font-size: 13px;
  line-height: 16px;
  border-radius: 4px;
  background-color: transparent;
  color: var(--textHeaderColorTransparent, rgba(255, 255, 255, 0.3)) !important;
  padding: 3px 8px !important;
  flex: 1 1 auto;
  overflow: hidden;
  justify-content: flex-start;
  border: none;
  text-transform: uppercase;
  text-align: center;
  font-size: 13px;
  font-weight: 500;
  outline: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-family: inherit;
  text-decoration: none;
  position: relative;
  white-space: nowrap;
  transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
}
</style>
