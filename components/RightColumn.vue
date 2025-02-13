<script setup>
import { ref } from "vue"
import ProfileDropDown from "./ProfileDropDown.vue";

const dropdownRef = ref(null)

const toggleDropdown = () => {
  if (dropdownRef.value) {
    dropdownRef.value.toggleDropdown();
  }
}
</script>

<template>
  <div class="rightColumn">
    <button type="button" class="languageButton">
      RU
    </button>
    
    <!-- Кнопка профиля -->
    <button type="button" class="profileButton" @click="toggleDropdown">
      Профиль
    </button>
    <ProfileDropDown ref="dropdownRef" />
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

.languageButton:hover,
.languageButton:active,
.languageButton:focus {
  color: var(--textHeaderColorAccent, #f1f1f1) !important;
  background-color: var(--textHeaderColorTransparent, rgba(255, 255, 255, 0.3)) !important;
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

.profileButton:hover,
.profileButton:active,
.profileButton:focus {
  color: var(--textHeaderColorAccent, #f1f1f1) !important;
  background-color: var(--textHeaderColorTransparent, rgba(255, 255, 255, 0.3)) !important;
}
</style>
