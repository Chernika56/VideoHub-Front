<script setup>
import { onMounted, onUnmounted } from 'vue'
import { profilePopupState } from '@/stores/profilePopup';
import { useRouter } from 'vue-router'

const router = useRouter()

const closePopupOnClickOutside = (event) => {
    const popup = document.querySelector('.profilePopup')
    if (popup && !popup.contains(event.target) && !event.target.closest('.profileButton')) {
        profilePopupState.closePopup()
    }
}

onMounted(() => {
    // Добавляем обработчик кликов при монтировании компонента
    document.addEventListener('click', closePopupOnClickOutside)
})

onUnmounted(() => {
    // Убираем обработчик кликов при размонтировании компонента
    document.removeEventListener('click', closePopupOnClickOutside)
})

function logout() {
    profilePopupState.logout()
    router.push('/auth')
}

function openProfile() {
    profilePopupState.closePopup()
    router.push('/profile')
}
</script>

<template>
    <div v-if="profilePopupState.isProfilePopupVisible" class="profilePopup">
        <button @click="openProfile" class="menuItem">Профиль</button>
        <button @click="" class="menuItem">Сообщения</button>
        <button @click="logout" class="menuItem">Выйти</button>
    </div>
</template>

<style>
.profilePopup {
    position: absolute;
    /* Фиксированное позиционирование относительно окна */
    top: 41px;
    /* Отступ от верхнего края окна */
    right: 10px;
    /* Отступ от правого края окна */
    max-height: 702px;
    background-color: white;
    border-radius: 4px;
    padding: 4px 0;
    overflow-y: auto;
    box-shadow: 0 1px 5px 0 rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 3px 1px -2px rgba(0, 0, 0, 0.12);
}

.profilePopup button:last-child {
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