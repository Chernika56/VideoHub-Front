<script setup>
</script>

<template>
    <header class="topNavigation">
        <nuxt-link to="/" class="logo">
            <!-- <img alt="Vue logo" class="logoImg" src="@/assets/logo.svg" /> -->
        </nuxt-link>
        <MainColumn />
        <RightColumn />
    </header>
</template>

<style scoped>
.topNavigation {
    background-color: var(--headerColor, #252a33);
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    height: 42px;
    display: flex;
    align-items: center;
    padding: 0 16px;
    overflow: hidden;
    z-index: 2;
}

.logo {
    color: #fff;
    width: 154px;
    height: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-right: 16px;
    flex-shrink: 0;
}

.logoImg {
    max-width: 130px;
    max-height: 40px;
}
</style>
