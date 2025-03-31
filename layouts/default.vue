<script setup>

const authStore = useAuthStore();

await authStore.whoami();

if (!authStore.authenticated) {
    navigateTo('/auth')
}

const collectionNav = ref([])

if (authStore.accessLevel === "User") {
    collectionNav.value = [
        { title: 'cameras', text: 'Камеры' },
        //{ title: 'images', text: 'Изображение' },
        { title: 'favorites', text: 'Избранные' },
        { title: 'mosaics', text: 'Мозаики' },
        { title: 'map', text: 'Карта' },
        { title: 'events', text: 'События' },
    ]
} else if (authStore.accessLevel === "Admin") {
    collectionNav.value = [
        { title: 'cameras', text: 'Камеры' },
        //{ title: 'images', text: 'Изображение' },
        { title: 'favorites', text: 'Избранные' },
        { title: 'mosaics', text: 'Мозаики' },
        { title: 'map', text: 'Карта' },
        { title: 'events', text: 'События' },
        { title: 'users', text: 'Пользователи' },
        { title: 'organizations', text: 'Организации' },
        { title: 'presets', text: 'Пресеты камер' },
    ]
}

// const collectionSettings = [
//     { title: 'settings', text: 'Настройки' },
//     { title: 'reports', text: 'Состояние' },
//     { title: 'assignment', text: 'Журнал доступа' }
// ]

// const collectionFooter = [
//     { title: 'Powered by', text: 'Ya' },
//     { title: 'Версия:', text: '0.1' },
//     { title: '0.1', text: 'Адрес' },
//     { title: 'phone', text: '123456789' },
//     { title: 'access_time', text: '9:00-18:00' }
// ]

</script>

<template>
    <v-app>
        <AppHeader />
        <!-- <AppNav :collection-nav="collectionNav" :collection-settings="collectionSettings" /> -->
        <AppNav :collection-nav="collectionNav" />
        <main>
            <slot></slot>
        </main>
    </v-app>
</template>

<style scoped>
main {
    position: fixed;
    top: 42px;
    left: 50px;
    right: 0;
    bottom: 0;
    overflow: auto;
    overflow-x: hidden;
    padding: 20px;
    position: relative;
    min-height: 100%;
    background-color: var(--backgroundColorMain, #f3f5f7);
    width: calc(100% - 50px);

    /* left: 50px;
    position: fixed;
    top: 42px;
    bottom: 0;
    right: 0;
    overflow: auto;
    overflow-x: hidden;
    padding: 20px;
    position: relative;
    min-height: 100%;
    background-color: var(--backgroundColorMain, #f3f5f7); */
}

@media (min-width: 991px) {
    main {
        left: 170px;
        width: calc(100% - 170px);
    }
}
</style>