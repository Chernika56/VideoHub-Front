<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useHead } from '#imports';


const route = useRoute();

// Динамическое обновление заголовка
definePageMeta({
  title: computed(() => stream.value?.title || 'Камера'),
  //title: 'Камера',
});

const player = ref(null);
const videoUrl = ref(null);
const stream = ref(null);
const maxRetries = 3; // Максимальное количество попыток
let retryCount = 0;   // Счетчик попыток

const disabled = ref(false);

const timeRange = ref([
  new Date(Date.now() - 24 * 60 * 60 * 1000),
  new Date(),
  // new Date('2025-02-03T17:00:00.000'),
  // new Date('2025-02-03T20:00:00.000'),
  // new Date(2024, 6, 22, 56, 52),
])

const minDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30)
const maxDate = new Date(Date.now() + 24 * 60 * 60 * 1000)

const fetchVideoUrl = async () => {
  try {
    const { data } = await useFetch(`/api/cameras/${route.params.videoName}`);

    // useFetch(`/api/cameras/${route.params.videoName}`, {
    //   method: 'PUT',
    //   body: JSON.stringify(data.value),
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    // })

    if (!data.value && retryCount < maxRetries) {
      retryCount++;
      console.warn(`Попытка ${retryCount}: Данные не загрузились, пробуем еще раз...`);
      setTimeout(fetchVideoUrl, 1000); // Повтор запроса через 1 сек
      return;
    }

    if (data.value) {
      stream.value = data.value;
      retryCount = 0; // Сброс счетчика при успешной загрузке

      const startDate = timeRange.value[0]
      const endDate = timeRange.value[1]

      const startTime = Math.round(startDate.getTime() / 1000);
      const durationInSeconds = Math.round(endDate - startDate) / 1000;
      const index = `index-${startTime}-${durationInSeconds}.m3u8`;
      videoUrl.value = stream.value.videoUrl.replace('index.m3u8', index);
      //videoUrl.value = stream.value.videoUrl.replace('index.m3u8', 'shoutcast');
      //videoUrl.value = "http://172.16.0.48/test/embed.html"
      //videoUrl.value = "http://172.16.0.48/demo/mpegts/index.m3u8"
    } else {
      console.error('Ошибка загрузки данных: превышено количество попыток.');
    }

  } catch (error) {
    console.error('Ошибка запроса:', error);
  }
}

watch(stream, (newStream) => {
  if (newStream) {
    useHead({ title: newStream.title || 'Камера' });
  }
})

const saveTimeRange = () => {
  if (timeRange.value[0] < minDate) {
    timeRange.value[0] = minDate; 
  }
  
  if (timeRange.value[1] > maxDate) {
    timeRange.value[1] = maxDate;
  }
};

watch(timeRange, (newRange) => {
  saveTimeRange();
  fetchVideoUrl();
}, { deep: true });

onMounted(async () => {
  await fetchVideoUrl();
});



</script>

<template>
  <h1 class="video-title">Видео: {{ stream?.title || 'Загрузка...' }}</h1>
  <div class="video-player-container">
    <VueVideoPlayer ref="player" class="video-js" v-if="videoUrl != null" :src="videoUrl" :poster="stream?.previewUrl"
      @update:height="videoHeight = player.$el.offsetHeight" controls aspectRatio="16:9"
      :playbackRates="[0.5, 1, 2, 4, 8, 16]" /> 
  </div>
  <div class="date-time-container">
    <h2>Выбор периода с датой и временем</h2>
    <p>min: {{ minDate }}</p>
    <p>max: {{ maxDate }}</p>

    <!-- Выбор первой даты с временем -->
    <DatePicker v-model:value="timeRange" type="datetime" :min-date="minDate" :max-date="maxDate" :clearable="false"
      show-time range confirm :disabled="disabled" placeholder="Выберите начальную дату" />

    <div v-if="true">
      <p>Выбранный период:</p>
      <p>Начало: {{ timeRange[0] }}</p>
      <p>Конец: {{ timeRange[1] }}</p>
    </div>
  </div>
</template>

<style>
.video-title {
  text-align: center;
  /* Центрируем заголовок */
  margin-top: 80px;
  margin-left: 170px;
  font-size: 24px;
  /* Размер шрифта заголовка */
  color: #333;
  /* Цвет текста заголовка */
}

.video-player-container {
  display: flex;
  justify-content: center;
  /* Центрируем плеер горизонтально */
  align-items: center;
  /* Центрируем плеер вертикально */
  margin-left: 170px;
  /* Учет ширины навигационной панели */
  padding-top: 20px;
  padding-bottom: 20px;
  padding-left: 150px;
  padding-right: 150px;
  max-width: calc(100% - 170px);
  background-color: var(--backgroundColorMain, #f3f5f7);
  /* Задний фон контейнера */
}

.date-time-container {
  justify-content: center;
  /* Центрируем плеер горизонтально */
  align-items: center;
  /* Центрируем плеер вертикально */
  margin-left: 170px;
  /* Учет ширины навигационной панели */
  padding-top: 20px;
  padding-bottom: 20px;
  padding-left: 150px;
  padding-right: 150px;
  max-width: calc(100% - 170px);
  background-color: var(--backgroundColorMain, #f3f5f7);
}

.video-js {
  width: 100%;
}

.video-js .vjs-big-play-button {
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
}
</style>