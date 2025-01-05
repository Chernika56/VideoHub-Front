<script setup>
import PopupPrifile from '@/components/PopupPrifile.vue';
import { ref, onMounted } from 'vue';
import axiosApi from '../services/axiosApi.js'
import { authState } from '@/stores/auth.js';
import { useRouter } from 'vue-router';
import { defineProps, computed } from 'vue';

const props = defineProps({
  videoName: String,
  videoPath: String,
});

const videoPlayer = ref(null);
const router = useRouter();
const playerOptions = ref(null);

const onError = () => {
  console.error('Произошла ошибка при загрузке видео');
};

const fetchFullVideo = async (url) => {
  try {
    const response = await axiosApi.get(url, {
      responseType: 'blob',
    });

    if (response.status === 200) {
      return URL.createObjectURL(response.data);
    }
  } catch (error) {
    // Проверяем, есть ли ответ от сервера
    if (error.response) {
      if (error.response.status === 401) {
        alert('Неавторизован. Выход из аккаунта.');
        authState.logout();
        router.push('/auth');
      } else {
        console.error(`Ошибка загрузки видео: ${error.response.status}`);
      }
    } else {
      console.error('Ошибка сети или другая проблема:', error.message);
    }

    // Пробрасываем ошибку для обработки на уровне вызова функции
    throw error;
  }
};

// В момент монтирования компонента запросим полное видео
onMounted(async () => {
  const videoUrl = 'https://localhost:7277/api/v1.0/video?path=' + props.videoPath + '.mp4'; // Замените на путь к вашему видео
  console.log(videoUrl)
  
  try {
    const blobUrl = await fetchFullVideo(videoUrl);

    // Обновляем настройки плеера
    playerOptions.value = {
      autoplay: false,
      controls: true,
      responsive: true,
      fluid: false,
      playbackRates: [0.5, 1, 1.5, 2],
      sources: [
        {
          //src: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          src: blobUrl,
          type: 'video/mp4',
        },
      ],
    };
  } catch (error) {
    console.error('Ошибка загрузки видео:', error);
  }
});


</script>

<template>
  <h1 class="video-title">Видео:  {{ props.videoName }}</h1>
  <div class="video-player-container">
    <VueVideoPlayer
      v-if="playerOptions"
      class="video-js"
      controls
      aspectRatio="16:9"
      :options="playerOptions"
      @error="onError"
    />
    <!-- <video ref="videoPlayer" controls @error="onError" @canplay="onCanPlay"></video> -->
  </div>

  <PopupPrifile />
</template>

<style>

.video-title {
  text-align: center; /* Центрируем заголовок */
  margin-top: 80px;
  margin-left: 170px;
  font-size: 24px; /* Размер шрифта заголовка */
  color: #333; /* Цвет текста заголовка */
}

.video-player-container {
  display: flex;
  justify-content: center; /* Центрируем плеер горизонтально */
  align-items: center; /* Центрируем плеер вертикально */
  margin-left: 170px; /* Учет ширины навигационной панели */
  padding-top: 20px;
  padding-bottom: 20px;
  padding-left: 150px;
  padding-right: 150px;
  max-width: calc(100% - 170px);
  background-color: var(--backgroundColorMain, #f3f5f7); /* Задний фон контейнера */
}

.video-js {
  width: 100%;
}

</style>