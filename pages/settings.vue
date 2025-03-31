<script setup>
definePageMeta({
    title: 'Настройки',
})

// const { data, error, status } = useFetch('https://localhost:7277/api/v1.0/cameras', {
//     method: "GET",
//     query: { folderId: [1, 2, 3, 4].join(',') },
//     credentials: 'include',
// })

// const { data, error, status } = useFetch(`https://localhost:7277/api/v1.0/cameras/${cameraName}`, {
//     method: "GET",
//     credentials: 'include',
// })

// const { data, error, status } = useFetch(`https://localhost:7277/api/v1.0/cameras/${cameraName}`, {
//     method: "PUT",
//     body: {
//         comment: "comment",
//         coordinates: "52 52",
//         dvrDepth: 1,
//         dvrLockDays: 1,
//         dvrPath: "dvr",
//         dvrSpace: 1,
//         folderId: 1,
//         motionDetectorEnabled: true,
//         onvifProfile: "media_profile1",
//         onvifPTZ: true,
//         onvifURL: "http://admin:321678!Qw@172.16.0.239",
//         permissions: {
//             view: true,
//             edit: true,
//             ptz: true,
//             dvr: true,
//             dvrDepthLimit: 1,
//             actions: true,
//         },
//         postalAddress: "ул.Пушкина",
//         presetId: 1,
//         streamUrl: "rtsp://admin:321678!Qw@172.16.0.239:554/media/video1",
//         streamerId: 1,
//         subStreamUrl: "",
//         title: "Cam_ATS-327",
//     },
//     credentials: 'include',
// })

// const { data, error, status } = useFetch(`https://localhost:7277/api/v1.0/cameras/${cameraName}`, {
//     method: "DELETE",
//     credentials: 'include',
// })

</script>

<template>
    <div>
        Это страница Настроек
    </div>
</template>

<style scoped>

</style>