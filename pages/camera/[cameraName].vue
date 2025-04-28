<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useHead } from '#imports';
import FlussonicMsePlayer from '@flussonic/flussonic-mse-player'

const apiUrl = useRuntimeConfig().public.API_BASE_URL ?? window.location.origin
const route = useRoute();
const router = useRouter();

definePageMeta({
    title: computed(() => stream.value?.title || 'Камера'),
    //title: 'Камера',
});

const stream = ref({});
const streamers = ref([]);
const organizations = ref([]);
const presets = ref([]);
const folders = ref([]);
const errorMessage = ref({});
const maxRetries = 3;
let retryCount = 0;

const videoRef = ref(null)
const player = shallowRef(null)
const isPlaying = ref(false)

const fetchStreamers = async () => {
    try {
        if (retryCount < maxRetries) {
            const { data } = await useFetch(`${apiUrl}/api/v1.0/streamers`, {
                method: "GET",
                credentials: 'include',
            });

            // console.log(`Попытка ${retryCount + 1} (стримеры):`, data.value);

            if (!data.value) {
                retryCount++;
                console.warn(`Попытка ${retryCount}: Данные не загрузились, пробуем еще раз через 1 сек...`);
                setTimeout(fetchStreamers, 1000);
                return;
            }

            streamers.value = data.value
            retryCount = 0
        } else {
            errorMessage.value = 'Превышено число попыток'
            console.error(errorMessage.value)
        }

    } catch (error) {
        errorMessage.value = 'Ошибка загрузки стримеров';
        console.error('Ошибка загрузки стримеров:', error);
    }
}

const fetchOrganizations = async () => {
    try {
        if (retryCount < maxRetries) {
            const { data } = await useFetch(`${apiUrl}/api/v1.0/organizations`, {
                method: "GET",
                credentials: 'include',
            });

            //console.log(`Попытка ${retryCount + 1} (организации):`, data.value)

            if (!data.value) {
                retryCount++;
                console.warn(`Попытка ${retryCount}: Данные не загрузились, пробуем еще раз через 1 сек...`);
                setTimeout(fetchOrganizations, 1000);
                return;
            }

            organizations.value = data.value
            retryCount = 0
        } else {
            errorMessage.value = 'Превышено число попыток'
            console.error(errorMessage.value)
        }

    } catch (error) {
        errorMessage.value = 'Ошибка загрузки организаций';
        console.error('Ошибка загрузки организаций:', error);
    }
};

const fetchFolders = async () => {
    try {
        if (retryCount < maxRetries) {
            const { data } = await useFetch(`${apiUrl}/api/v1.0/folders`, {
                method: "GET",
                credentials: 'include',
            });

            // console.log(`Попытка ${retryCount + 1} (папки):`, data.value);

            if (!data.value) {
                retryCount++;
                console.warn(`Попытка ${retryCount}: Данные не загрузились, пробуем еще раз через 1 сек...`);
                setTimeout(fetchFolders, 1000);
                return;
            }

            folders.value = data.value
            retryCount = 0
        } else {
            errorMessage.value = 'Превышено число попыток'
            console.error(errorMessage.value)
        }

    } catch (error) {
        errorMessage.value = 'Ошибка загрузки папок';
        console.error('Ошибка загрузки папок:', error);
    }
};

const fetchPresets = async () => {
    try {
        if (retryCount < maxRetries) {
            const { data } = await useFetch(`${apiUrl}/api/v1.0/presets`, {
                method: "GET",
                credentials: 'include',
            });

            // console.log(`Попытка ${retryCount + 1} (пресеты):`, data.value);

            if (!data.value) {
                retryCount++;
                console.warn(`Попытка ${retryCount}: Данные не загрузились, пробуем еще раз через 1 сек...`);
                setTimeout(fetchPresets, 1000);
                return;
            }

            presets.value = data.value
            retryCount = 0
        } else {
            errorMessage.value = 'Превышено число попыток'
            console.error(errorMessage.value)
        }

    } catch (error) {
        errorMessage.value = 'Ошибка загрузки пресетов';
        console.error('Ошибка загрузки пресетов:', error);
    }
}

const fetchVideoUrl = async () => {
    try {
        const { data } = useFetch(`${apiUrl}/api/v1.0/cameras/${route.params.cameraName}`, {
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
        const videoUrl = FlussonicMsePlayer.replaceHttpByWS(`${streamerUrl}/${stream.value.name}/mse_ld?token=${token}`)

        player.value = new FlussonicMsePlayer(
        videoRef.value,
        videoUrl,
        {
            debug: true,
            wsReconnect: true,
            retryMuted: true,
            // onMediaInfo: (info) => console.log('📺 MediaInfo:', info),
            // onEvent: (e) => console.log('📡 Событие:', e),
            // onError: (e) => console.error('❌ Ошибка плеера:', e),
            // onStartStalling: () => console.log('⏳ Зависание...'),
            // onEndStalling: () => console.log('✅ Возобновлено'),
            // onStats: (stats) => console.log('📊 Статистика:', stats),
        }
    )
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

onMounted(async () => {
    await fetchVideoUrl();
    await fetchStreamers();
    await fetchOrganizations();
    await fetchFolders();
    await fetchPresets();
});

onBeforeUnmount(() => {
    if (player.value) {
        // console.log('🛑 Останавливаем поток')
        player.value.stop()
    }
})

const startPlayback = () => {
    if (isPlaying.value) return

    isPlaying.value = true
    player.value.play().catch((err) => {
        // console.error('Не удалось запустить воспроизведение:', err)
        isPlaying.value = false
    })
}

const stopPlayback = () => {
    if (!isPlaying.value) return

    player.value.stop()
    isPlaying.value = false
    // console.log('⏹️ Воспроизведение остановлено')
}

const dvrDepthOptions = ref([
    { id: null, name: "DVR отключен" },
    { id: 1, name: "1 день" },
    { id: 2, name: "2 дня" },
    { id: 3, name: "3 дня" },
    { id: 7, name: "7 дней" },
]);

const dvrLockDaysOptions = ref([
    { id: null, name: "DVR отключен" },
    { id: 1, name: "1 день" },
    { id: 2, name: "2 дня" },
    { id: 3, name: "3 дня" },
    { id: 7, name: "7 дней" },
]);

const thumbnailsOptions = ref([
    { id: null, name: "Не использовать" },
    { id: 1, name: "1 день" },
    { id: 2, name: "2 дня" },
    { id: 3, name: "3 дня" },
    { id: 7, name: "7 дней" },
]);

const isValid = computed(() => {
    return stream.value && stream.value.title && stream.value.streamUrl && stream.value.streamerId && stream.value.organizationId
        && stream.value.folderId && stream.value.presetId;
});

const submitForm = async () => {
    if (isValid.value) {
        console.log('Отправка данных:', stream.value);

        const { data, error, status } = await useFetch(`${apiUrl}/api/v1.0/cameras/${stream.value.name}`, {
            method: "PUT",
            body: stream.value,
            credentials: 'include',
        })

        navigateTo('/cameras')
    } else {
        alert('Заполните обязательные поля!');
    }
};

const cancel = () => {
    if (window.history.length > 1) {
		router.back();
	} else {
		navigateTo('/cameras'); 
	}
}

const deleteCamera = async () => {
    const { data, error, status } = await useFetch(`${apiUrl}/api/v1.0/cameras/${route.params.cameraName}`, {
        method: "DELETE",
        credentials: 'include',
    })
    
    navigateTo('/cameras')
}
</script>

<template>
    <div>
        <div>
            <h1 class="video-title">Видео: {{ stream?.title || 'Загрузка...' }}</h1>
            <video ref="videoRef" controls muted playsinline
                style="width: 100%; max-height: 100%; background: black;" />
            <div style="margin-top: 1rem;">
                <button @click="startPlayback">▶️ Начать воспроизведение</button>
                <button @click="stopPlayback" style="margin-left: 10px;">⏹️ Остановить воспроизведение</button>
                <button style="margin-left: 10px;">
                    <nuxt-link :to="`/VideoPlayer/${route.params.cameraName}`">
                        Воспроизвести архив
                    </nuxt-link>
                </button>
            </div>
        </div>

        <v-container class="fill-height d-flex justify-center align-center">
            <v-sheet class="pa-4" width="1000" style="max-height: 90vh; overflow: hidden;">
                <v-form @submit.prevent="submitForm">
                    <v-row>
                        <v-col cols="6">
                            <v-text-field v-model="stream.title" label="Название. English"
                                :rules="[v => !!v || 'Обязательное поле']" required density="compact"
                                outlined></v-text-field>
                            <v-text-field v-model="stream.comment" label="Коментарий" density="compact"
                                outlined></v-text-field>
                            <v-text-field v-model="stream.streamUrl" label="URL потока"
                                :rules="[v => !!v || 'Обязательное поле']" required density="compact"
                                outlined></v-text-field>
                            <v-text-field v-model="stream.subStreamUrl" label="URL подпотока" density="compact"
                                outlined></v-text-field>
                        </v-col>

                        <v-col cols="6">
                            <v-select v-model="stream.streamerId" :items="streamers" item-title="hostName"
                                item-value="id" label="Стример" :rules="[v => !!v || 'Обязательное поле']" required
                                density="compact" outlined></v-select>
                            <v-select v-model="stream.organizationId" :items="organizations" item-title="title"
                                item-value="id" label="Организация" :rules="[v => !!v || 'Обязательное поле']" required
                                density="compact" outlined></v-select>
                            <v-select v-model="stream.presetId" :items="presets" label="Пресет" item-title="title"
                                item-value="id" :rules="[v => !!v || 'Обязательное поле']" required density="compact"
                                outlined></v-select>
                            <v-select v-model="stream.folderId" :items="folders" label="Папка" item-title="title"
                                item-value="id" :rules="[v => !!v || 'Обязательное поле']" required density="compact"
                                outlined></v-select>
                        </v-col>

                        <v-col cols="6">
                            <v-select v-model="stream.dvrDepth" :items="dvrDepthOptions" item-title="name"
                                item-value="id" label="Глубина DVR" density="compact" outlined></v-select>
                            <v-select v-model="stream.dvrLockDays" :items="dvrLockDaysOptions" item-title="name"
                                item-value="id" label="Лимит DVR" density="compact" outlined></v-select>
                            <v-text-field v-model.number="stream.dvrSpace" label="Пространство DVR, ГБ" type="number"
                                density="compact" outlined></v-text-field>
                            <v-select :items="thumbnailsOptions" item-title="name" item-value="id"
                                label="Точные миниатюры событий" density="compact" outlined></v-select>
                        </v-col>

                        <v-col cols="6">
                            <label class="custom-checkbox">
                                <input type="checkbox" v-model="stream.motionDetectorEnabled">
                                Включить распознавание
                            </label>
                            <label class="custom-checkbox">
                                <input type="checkbox" v-model="stream.enabled">
                                Включена
                            </label>
                            <!-- <v-checkbox v-model="stream.motionDetectorEnabled" label="Включить распознавание" density="compact"
               outlined></v-checkbox> -->
                            <!-- <v-checkbox v-model="stream.enabled" label="Включена" density="compact" outlined ></v-checkbox> -->
                            <v-text-field v-model="stream.coordinates" label="Координаты" density="compact"
                                outlined></v-text-field>
                            <v-text-field v-model="stream.postalAddress" label="Адрес" density="compact"
                                outlined></v-text-field>
                        </v-col>
                    </v-row>

                    <v-row class="align-center">
                        <v-col class="d-flex" cols="6">
                            <v-btn type="submit" :disabled="!isValid" color="primary">Сохранить изменения</v-btn>
                            <v-btn @click="cancel" class="ml-3">Отмена</v-btn>
                        </v-col>
                        <v-col class="d-flex justify-end" cols="6">
                            <v-btn @click="deleteCamera" color="red">Удалить камеру</v-btn>
                        </v-col>
                    </v-row>
                </v-form>
            </v-sheet>
        </v-container>
    </div>

</template>

<style>
video {
    outline: none;
}

.video-title {
    display: flex;
    flex-direction: column;
    text-align: center;
    margin-top: 10px;
    /* margin-left: 170px; */
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

.video-js {
    width: 100%;
}

.video-js .vjs-big-play-button {
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
}

.custom-checkbox {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 16px;
    padding-top: 10px;
    padding-bottom: 30px;
}

.custom-checkbox input {
    appearance: none;
    width: 20px;
    height: 20px;
    border: 2px solid #1976d2;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
}

.custom-checkbox input:checked {
    background-color: #1976d2;
    border-color: #1976d2;
    position: relative;
}

.custom-checkbox input:checked::after {
    content: "✔";
    color: white;
    font-size: 14px;
    font-weight: bold;
    position: absolute;
}

html,
body {
    overflow-x: hidden;
    height: 100%;
}
</style>