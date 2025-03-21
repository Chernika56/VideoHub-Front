<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const authStore = useAuthStore()

const isOpen = ref(false)
const dropdownRef = ref(null)

const closeDropdown = (event) => {
    if (dropdownRef && !dropdownRef.value?.contains(event.target) && !event.target.closest('.profileButton')) {
        isOpen.value = false
    }
}

// const openDropdown = () => {
//     console.log(321)
//     isOpen.value = true;
// };

const toggleDropdown = () => {
    isOpen.value = !isOpen.value;
}

onMounted(() => {
    document.addEventListener('click', closeDropdown)
})

onUnmounted(() => {
    document.removeEventListener('click', closeDropdown)
})

defineExpose({ toggleDropdown });

const logout = () => {
    authStore.logUserOut()
    navigateTo('/auth')
    isOpen.value = false
}
</script>

<template>
    <teleport to='body'>
        <div v-if="isOpen" ref="dropdownRef" class="dropdown">
            <nuxt-link to="/profile" @click="isOpen=false">
                <button class="menuItem">Профиль</button>
            </nuxt-link>

            <nuxt-link to="/message" @click="isOpen=false">
                <button class="menuItem">Сообщения</button>
            </nuxt-link>

            <button class="menuItem" @click="logout">Выйти</button>
        </div>
    </teleport>
</template>

<style>
.dropdown {
    position: absolute;
    top: 41px;
    right: 10px;
    max-height: 702px;
    background-color: white;
    border-radius: 4px;
    padding: 4px 0;
    overflow-y: auto;
    box-shadow: 0 1px 5px 0 rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 3px 1px -2px rgba(0, 0, 0, 0.12);
    z-index: 1;
}

.dropdown button:last-child {
    margin-bottom: 0;
}

.menuItem {
    border-bottom: 1px solid rgba(0, 0, 0, 0.12);
    border: none;
    background-color: transparent;
    align-items: center;
    padding: 11px 16px;
    cursor: pointer;
    color: #343940;
    max-width: 100%;
    width: 100%;
    display: flex;
    position: relative;
    font-size: 14px;
}

.menuItem:hover,
.menuItem:focus {
    outline: none;
    color: #343940;
    text-decoration: none;
    background-color: rgba(0, 0, 0, 0.08);
}
</style>