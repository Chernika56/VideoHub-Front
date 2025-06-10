<script setup>
import { onMounted, ref, Static } from 'vue'
import FlussonicMsePlayer from '@flussonic/flussonic-mse-player'

const apiUrl = useRuntimeConfig().public.API_BASE_URL ?? window.location.origin
const route = useRoute();
const router = useRouter();

definePageMeta({
    title: computed(() => mosaic.value?.title || 'Мозаика'),
});

onMounted(async () => {
    await fetchMosaic();
});

const mosaic = ref();

const errorMessage = ref({});
const maxRetries = 3;
let retryCount = 0;

const videoRefs = ref([])
const player = shallowRef([])

const setVideoRef = (el, index) => {
  if (el) videoRefs.value[index] = el;
};

const isPlaying = ref(true)

const fetchMosaic = async () => {
    try {
        if (retryCount < maxRetries) {
            const { data } = await useFetch(`${apiUrl}/api/v1.0/mosaics/${route.params.mosaicId}`, {
                method: "GET",
                credentials: 'include',
            });

            console.log(`Попытка ${retryCount + 1} (мозаика):`, data.value)

            if (!data.value) {
                retryCount++;
                console.warn(`Попытка ${retryCount}: Данные не загрузились, пробуем еще раз через 1 сек...`);
                setTimeout(fetchMosaic, 1000);
                return;
            }

            mosaic.value = data.value;

            for (let i = 0; i < mosaic.value.cameras.length; i++) {
                const cam = mosaic.value.cameras[i];

                console.log(cam.name);

                const streamerUrl = await getStreamerApiUrl(cam.streamerId);
                const token = cam.playbackConfig.token;

                const videoUrl = FlussonicMsePlayer.replaceHttpByWS(`${streamerUrl}/${cam.name}/mse_ld?token=${token}`)

                player.value[i] = new FlussonicMsePlayer(
                    videoRefs.value[i],
                    videoUrl,
                    {
                        debug: false,
                        wsReconnect: true,
                        retryMuted: true,
                    }
                )

                player.value[i].play()
            }

            retryCount = 0
        } else {
            errorMessage.value = 'Превышено число попыток'
            console.error(errorMessage.value)
        }
    } catch (error) {
        errorMessage.value = 'Ошибка загрузки мозаики';
        console.error("Ошибка загрузки мозаики:", error);
    }
};

const getStreamerApiUrl = async (streamerId) => {
    const { data } = await useFetch(`${apiUrl}/api/v1.0/streamers/${streamerId}`, {
        method: "GET",
        credentials: "include",
    });

    return data.value?.apiUrl;
};

onBeforeUnmount(() => {
    player.value.forEach(p => {
        try {
            p?.stop();
            p?.destroy?.();
        } catch (e) {
            console.warn('Ошибка при остановке плеера', e);
        }
    });
    player.value = [];
});

const gridColumns = computed(() => {
    const size = Number(mosaic.value?.type?.[0]) || 2;
    return `repeat(${size}, 1fr)`;
});
</script>

<template>
    <div class="video-grid" :style="{ gridTemplateColumns: gridColumns }">
        <video v-for="(cam, i) in mosaic?.cameras ?? []" :key="cam.name" :ref="el => setVideoRef(el, i)" muted
            playsinline autoplay controls style="width: 100%; aspect-ratio: 16 / 9; background: black;" />
    </div>
</template>

<style scoped>
.video-grid {
    display: grid;
    gap: 1px;
    width: 100%;
}
</style>