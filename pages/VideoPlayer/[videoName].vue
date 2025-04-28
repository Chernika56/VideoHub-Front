<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useHead } from '#imports';

const apiUrl = useRuntimeConfig().public.API_BASE_URL ?? window.location.origin

const route = useRoute();
const router = useRouter();

definePageMeta({
    title: computed(() => stream.value?.title || 'Камера'),
    //title: 'Камера',
});

const stream = ref({});
const videoUrl = ref({});
const errorMessage = ref({});
const maxRetries = 3;
let retryCount = 0;

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
        const { data } = useFetch(`${apiUrl}/api/v1.0/cameras/${route.params.videoName}`, {
            method: "GET",
            credentials: 'include',
        });

        if (!data.value && retryCount < maxRetries) {
            retryCount++;
            console.warn(`Попытка ${retryCount}: Данные не загрузились, пробуем еще раз...`);
            setTimeout(fetchVideoUrl, 1000);
            return;
        }

        stream.value = data.value;

        var streamerUrl = await getStreamerApiUrl(stream.value.streamerId);

        const token = stream.value.playbackConfig.token;
        stream.value.previewUrl = `${streamerUrl}/${stream.value.name}/preview.jpg?token=${token}`;
        stream.value.videoUrl = `${streamerUrl}/${stream.value.name}/index.m3u8?token=${token}`;
        //s.streamUrl = `${s.stream_url}?token=${token}`

        retryCount = 0;

        const startDate = timeRange.value[0]
        const endDate = timeRange.value[1]

        const startTime = Math.round(startDate.getTime() / 1000);
        const durationInSeconds = Math.round(endDate - startDate) / 1000;
        const index = `index-${startTime}-${durationInSeconds}.m3u8`;
        videoUrl.value = stream.value.videoUrl.replace('index.m3u8', index);
        // videoUrl.value = stream.value.videoUrl;
        //videoUrl.value = "http://172.16.0.48/test/embed.html"
        //videoUrl.value = "http://172.16.0.48/demo/mpegts/index.m3u8"

    } catch (error) {
        console.error('Ошибка запроса:', error);
    }
}

const getStreamerApiUrl = async (streamerId) => {
    const { data } = await useFetch(`${apiUrl}/api/v1.0/streamers/${streamerId}`, {
        method: "GET",
        credentials: "include",
    });

    return data.value?.apiUrl;
};

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
    <div>
        <h1 class="video-title">Видео: {{ stream?.title || 'Загрузка...' }}</h1>
        <div class="video-player-container">
            <VueVideoPlayer ref="player" class="video-js" v-if="videoUrl != null" :src="videoUrl"
                :poster="stream?.previewUrl" controls
                aspectRatio="16:9" :playbackRates="[0.5, 1, 2, 4, 8, 16]" type="application/x-mpegURL"/>
        </div>
        <div class="date-time-container">
            <h2>Выбор периода с датой и временем</h2>
            <p>min: {{ minDate }}</p>
            <p>max: {{ maxDate }}</p>

            <DatePicker v-model:value="timeRange" type="datetime" :min-date="minDate" :max-date="maxDate"
                :clearable="false" show-time range confirm :disabled="disabled" placeholder="Выберите начальную дату" />

            <div v-if="true">
                <p>Выбранный период:</p>
                <p>Начало: {{ timeRange[0] }}</p>
                <p>Конец: {{ timeRange[1] }}</p>
            </div>
        </div>
    </div>
</template>

<style scoped>
.video-title {
    display: flex;
    flex-direction: column;
    text-align: center;
    margin-top: 10px;
    margin-left: 170px;
    font-size: 24px;
    color: #333;
}

.video-player-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-left: 170px;
    padding-top: 20px;
    padding-bottom: 20px;
    padding-left: 150px;
    padding-right: 150px;
    max-width: calc(100% - 170px);
    background-color: var(--backgroundColorMain, #f3f5f7);
}

.date-time-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-left: 170px;
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

html,
body {
    overflow-x: hidden;
    height: 100%;
}
</style>