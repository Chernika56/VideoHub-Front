<script setup>
// websocket = new WebSocket("ws://172.16.0.48/Cam_ATS-327-m96z0l1y/mse_ld?token=thisIsPersonalUserTokenAdmin");
// websocket = new WebSocket("wss://camdvr1.1net.by/cam_ats-327-e8c9f87c61/mse_ld?token=3.7zYlynuNAAAAAAAAAAEABjDhbwpXM0hUyLVTV2zai0-Ti-Ktp6PCwuv4");

// import { onMounted, onBeforeUnmount, ref } from 'vue';

// const videoRef = ref(null);
// let ws = null;
// let mediaSource = null;
// let sourceBuffer = null;
// let hasResumed = false;

// let lastAppendTime = 0;
// const appendInterval = 50;

// onMounted(() => {
//     ws = new WebSocket('ws://172.16.0.48/Cam_ATS-327-m96z0l1y/mse_ld?token=thisIsPersonalUserTokenAdmin');
//     ws.binaryType = 'blob';

//     ws.onopen = () => {
//         console.log('🔌 WebSocket подключён');
//     };

//     ws.onmessage = async (event) => {
//         // 📦 JSON-сообщения
//         if (typeof event.data === 'string') {
//             try {
//                 const msg = JSON.parse(event.data);

//                 if (msg.type === 'event' && msg.event === 'resumed') {
//                     console.log('▶️ Поток возобновлён');
//                     return;
//                 }

//                 if (msg.type === 'mse_init_segment') {
//                     const mimeType = msg.tracks[0].mime_type;
//                     const payload = msg.tracks[0].payload;

//                     const initSegment = Uint8Array.from(atob(payload), c => c.charCodeAt(0));

//                     mediaSource = new MediaSource();
//                     videoRef.value.src = URL.createObjectURL(mediaSource);

//                     mediaSource.addEventListener('sourceopen', () => {
//                         sourceBuffer = mediaSource.addSourceBuffer(mimeType);

//                         sourceBuffer.addEventListener('updateend', () => {
//                             console.log('✅ Сегмент добавлен.');

//                             if (!hasResumed && mediaSource.readyState === 'open') {
//                                 console.log('🚀 Отправляем "resume"');
//                                 ws.send('resume');
//                                 hasResumed = true;  // Устанавливаем флаг, чтобы не отправить снова
//                             }

//                             // if (mediaSource.readyState === 'open') {
//                             //     const videoElement = videoRef.value;
//                             //     // Получаем текущее время воспроизведения
//                             //     const currentTime = videoElement.currentTime;
//                             //     const videoDuration = videoElement.duration;

//                             //     // console.log(videoElement)
//                             //     // console.log(currentTime)
//                             //     // console.log(videoDuration)

//                             //     // if (!isNaN(videoDuration) && currentTime > 5) { 
//                             //     //     const removeStartTime = 0;  
//                             //     //     const removeEndTime = currentTime - 2;

//                             //     //     console.log(`Удаляем сегменты с ${removeStartTime} до ${removeEndTime}`);
//                             //     //     sourceBuffer.remove(removeStartTime, removeEndTime);  // Удаляем старые данные
//                             //     // }
//                             // }
//                         });

//                         sourceBuffer.appendBuffer(initSegment);
//                     });
//                 }
//             } catch (err) {
//                 console.error('Ошибка парсинга JSON:', err);
//             }
//         }

//         // 🎞 Бинарные сегменты
//         else if (event.data instanceof Blob) {
//             const buffer = await event.data.arrayBuffer();
            
//             if (sourceBuffer && !sourceBuffer.updating) {
//                 try {
//                     sourceBuffer.appendBuffer(buffer);
//                 } catch (err) {
//                     console.error('Ошибка добавления сегмента:', err);
//                 }
//             }
//         }
//     };

//     ws.onerror = (err) => {
//         console.error('WebSocket ошибка:', err);
//     };

//     ws.onclose = () => {
//         console.warn('WebSocket закрыт');
//     };
// });

// onBeforeUnmount(() => {
//     if (ws) {
//         ws.close();
//         ws = null;
//     }
// });
</script>

<template>
    <!-- <video ref="videoRef" controls autoplay muted style="width: 100%; height: auto;" /> -->
</template>

<style scoped>
/* video {
    background: black;
    max-width: 100%;
} */
</style>