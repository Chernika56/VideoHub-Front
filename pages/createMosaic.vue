<script setup>
const apiUrl = useRuntimeConfig().public.API_BASE_URL ?? window.location.origin
const route = useRoute();
const router = useRouter();

definePageMeta({
    title: 'Создание мозаики',
});

const mosaic = ref({
    title: null,
    type: null,
    organizationId: Number(route.query.defaultOrg),
    cameras: [],
});

let folders = [];
const cameras = ref([]);

const errorMessage = ref({});
const maxRetries = 5;
let retryCount = 0;

const fetchCameras = async () => {
    try {
        if (retryCount < maxRetries) {
            const { data, error, status } = await useFetch(`${apiUrl}/api/v1.0/cameras?folder_id=${folders}`, {
                method: "GET",
                credentials: 'include',
            });

            // console.log(`Попытка ${retryCount + 1} (камеры):`, data.value);

            if (!data.value) {
                retryCount++;
                console.warn(`Попытка ${retryCount}: Данные не загрузились, пробуем еще раз через 1 сек...`);
                setTimeout(fetchCameras, 1000);
                return;
            }

            cameras.value = data.value
            retryCount = 0
        } else {
            errorMessage.value = 'Превышено число попыток'
            console.error(errorMessage.value)
        }

    } catch (error) {
        errorMessage.value = 'Ошибка загрузки камер';
        console.error('Ошибка загрузки камер:', error);
    }
};

const fetchFolders = async () => {
    try {
        if (retryCount < maxRetries) {
            const org = Number(route.query.defaultOrg);

            const { data, error, status } = await useFetch(`${apiUrl}/api/v1.0/organizations/${org}/folders`, {
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

            data.value.forEach(folder => {
                folders.push(folder.id)
            })

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

onMounted(async () => {
    await fetchFolders();
    await fetchCameras();
});

const mosaicTypes = ref([
    { title: "2x2" },
    { title: "3x3" },
    { title: "4x4" },
])

const selectedCamera = ref(null);

const maxCameras = computed(() => {
    const size = Number(mosaic.value.type?.[0]) || 0;
    return size * size;
});

const availableCameras = computed(() => {
    return cameras.value
        .filter(c => !mosaic.value.cameras.includes(c.name))
        .map(c => ({ title: c.title, name: c.name }));
});

const addCamera = (cameraName) => {
    if (cameraName && !mosaic.value.cameras.includes(cameraName) && mosaic.value.cameras.length < maxCameras.value) {
        mosaic.value.cameras.push(cameraName);
    }
    selectedCamera.value = null;
};

const removeCamera = (cameraName) => {
    mosaic.value.cameras = mosaic.value.cameras.filter(name => name !== cameraName);
};

const isValid = computed(() =>
    mosaic.value.title &&
    mosaic.value.type &&
    mosaic.value.cameras.length > 0
);

const submitForm = async () => {
    if (!isValid.value) return;

    const { data, error } = await useFetch(`${apiUrl}/api/v1.0/mosaics`, {
        method: 'POST',
        credentials: 'include',
        body: mosaic.value,
    });

    if (!error.value) {
        navigateTo(`/organization/${data.value.id}`);
    } else {
        console.error('Ошибка при создании мозаики:', error.value);
        errorMessage.value = 'Ошибка создания мозаики';
    }
};

const cancel = () => {
    if (window.history.length > 1) {
        router.back();
    } else {
        navigateTo(`/organization/${route.query.defaultOrg}`)
    }
}

</script>

<template>
    <v-container class="d-flex justify-center align-center">
        <v-sheet class="pa-4" width="800" style="max-height: 90vh; overflow: auto;">
            <v-form @submit.prevent="submitForm">
                <v-row>
                    <v-col cols="12">
                        <v-text-field v-model="mosaic.title" label="Название мозаики"
                            :rules="[v => !!v || 'Обязательное поле']" required density="compact"
                            outlined></v-text-field>
                        <v-select v-model="mosaic.type" :items="mosaicTypes" item-title="title" item-value="title"
                            label="Тип" :rules="[v => !!v || 'Обязательное поле']" required density="compact"
                            outlined></v-select>

                        <v-autocomplete v-model="selectedCamera" :items="availableCameras" item-title="title"
                            item-value="name" label="Добавить камеру" :disabled="mosaic.cameras.length >= maxCameras"
                            :menu-props="{ maxHeight: 200 }" clearable density="compact" outlined
                            @update:modelValue="addCamera" />

                        <small>Добавлено: {{ mosaic.cameras.length }} / {{ maxCameras }}</small>

                        <v-chip v-for="name in mosaic.cameras" :key="name" class="ma-1" closable
                            @click:close="removeCamera(name)">
                            {{ (cameras.value ?? []).find(c => c.name === name)?.title ?? name }}
                        </v-chip>
                    </v-col>
                </v-row>
                <v-btn type="submit" :disabled="!isValid" color="primary">Создать мозаику</v-btn>
                <v-btn @click="cancel" style="margin-left: 30px;">Отмена</v-btn>
            </v-form>
        </v-sheet>
    </v-container>
</template>

<style scoped>
.switch-active .v-selection-control__input {
    color: green !important;
}

.btn-active {
    background-color: #1976D2 !important;
    color: white !important;
}
</style>
