<script setup>
const apiUrl = useRuntimeConfig().public.API_BASE_URL ?? window.location.origin

definePageMeta({
    title: 'Мозайки',
})
</script>

<template>
    <div>
        <MosaicsTable organization="" />
    </div>
</template>

<style scoped>

</style>