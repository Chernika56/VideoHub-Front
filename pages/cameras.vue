<script setup>

definePageMeta({
    title: 'Камеры',
})

const apiUrl = useRuntimeConfig().public.API_BASE_URL ?? window.location.origin
</script>

<template>
    <CamerasTable organization="" />
</template>

<style> 

</style>
