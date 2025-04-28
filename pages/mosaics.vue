<script setup>
definePageMeta({
    title: 'Мозайки',
})
import { onMounted, ref, Static } from 'vue'
import FlussonicMsePlayer from '@flussonic/flussonic-mse-player'

const videoRef = ref(null)
const player = shallowRef(null)
const isPlaying = ref(false)

// onMounted(() => {
//     // console.log('🎥 videoRef:', videoRef.value)

//     player.value = new FlussonicMsePlayer(
//         videoRef.value,
//         'ws://172.16.0.48/Cam_ATS-327-m96z0l1y/mse_ld?token=thisIsPersonalUserTokenAdmin',
//         {
//             debug: true,
//             wsReconnect: true,
//             retryMuted: true,
//             // onMediaInfo: (info) => console.log('📺 MediaInfo:', info),
//             // onEvent: (e) => console.log('📡 Событие:', e),
//             // onError: (e) => console.error('❌ Ошибка плеера:', e),
//             // onStartStalling: () => console.log('⏳ Зависание...'),
//             // onEndStalling: () => console.log('✅ Возобновлено'),
//             // onStats: (stats) => console.log('📊 Статистика:', stats),
//         }
//     )
// })

// onBeforeUnmount(() => {
//     if (player.value) {
//         // console.log('🛑 Останавливаем поток')
//         player.value.stop()
//     }
// })

// const startPlayback = () => {
//     if (isPlaying.value) return

//     isPlaying.value = true
//     player.value.play().catch((err) => {
//         // console.error('Не удалось запустить воспроизведение:', err)
//         isPlaying.value = false
//     })
// }

// const stopPlayback = () => {
//     if (!isPlaying.value) return

//     player.value.stop()
//     isPlaying.value = false
//     // console.log('⏹️ Воспроизведение остановлено')
// }
</script>

<template>
    <div>
        Это страницы Мозаик
        <!-- <video ref="videoRef" controls muted playsinline style="width: 100%; max-height: 100%; background: black;" />
        <div style="margin-top: 1rem;">
            <button @click="startPlayback">▶️ Начать воспроизведение</button>
            <button @click="stopPlayback" style="margin-left: 10px;">⏹️ Остановить воспроизведение</button>
        </div> -->
    </div>
</template>

<style scoped>
video {
    outline: none;
}
</style>