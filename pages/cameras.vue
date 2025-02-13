<script setup>

definePageMeta({
    title: 'Камеры',
})

const videos = ref([]); // Список видео
const errorMessage = ref(''); // Сообщение об ошибке
const maxRetries = 3; // Максимальное количество попыток
let retryCount = 0; // Счетчик попыток


const filter = ref({
    search: '',
    dvr_depth: '',
    streamer: '',
    organization_id: '',
    dvr_enabled: false,
    agent: false,
    onvif: false,
    vision_enabled: false,
    enabled: false,
});

const resetFilters = () => {
    filter.value = {
        search: '',
        dvr_depth: '',
        streamer: '',
        organization_id: '',
        dvr_enabled: false,
        agent: false,
        onvif: false,
        vision_enabled: false,
        enabled: false,
    };
};

// Функция для загрузки списка видео
const fetchVideos = async () => {
    try {
        console.log(filter)

        const { data } = await useFetch('/api/cameras', {
            method: 'GET',
            query: { ...filter.value },
        });
        console.log(`Попытка ${retryCount + 1}:`, data.value);

        if (!data.value && retryCount < maxRetries) {
            retryCount++;
            console.warn(`Попытка ${retryCount}: Данные не загрузились, пробуем еще раз через 1 сек...`);
            setTimeout(fetchVideos, 1000); // Повтор запроса через 1 сек
            return;
        }

        if (data.value) {
            videos.value = data.value;
            retryCount = 0; // Сброс счетчика после успешной загрузки
        } else {
            errorMessage.value = 'Ошибка загрузки списка видео';
            console.error('Ошибка: превышено количество попыток загрузки.');
        }
    } catch (error) {
        // if (error.response.status === 401) {
        //     alert('Неавторизован. Выход из аккаунта.');
        //     authState.logout();
        //     router.push('/auth');
        // }

        errorMessage.value = 'Ошибка загрузки списка видео';
        console.error('Ошибка загрузки видео:', error);
    }
};

onMounted(async () => {
    await fetchVideos();
});

const regex = /@([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)/;

const getStatusClass = (status) => (status ? 'status-green' : 'status-red');

const showColumnsMenu = ref(false);
const showFilterMenu = ref(false);

const columnsMenu = ref(null);
const filterMenu = ref(null);

const toggleColumnsMenu = () => {
    showColumnsMenu.value = !showColumnsMenu.value;
    showFilterMenu.value = false;
};

const toggleFilterMenu = () => {
    showFilterMenu.value = !showFilterMenu.value;
    showColumnsMenu.value = false;
};

const handleClickOutside = (event) => {
    if (columnsMenu.value && !columnsMenu.value.contains(event.target) && !event.target.closest('.buttons')) {
        showColumnsMenu.value = false;
    }

    if (filterMenu.value && !filterMenu.value.contains(event.target) && !event.target.closest('.buttons')) {
        showFilterMenu.value = false;
    }
};

onMounted(() => {
    document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
});

watch(filter, (newFilter, oldFilter) => {
    fetchVideos();
}, { deep: true });

const tableColumns = ref({
    // status: { label: "Статус", custom: false, visible: true },
    name: { label: "Название", custom: false, visible: true },
    streamUrl: { label: "URL потока", custom: true, visible: false },
    subStreamUrl: { label: "URL подпотока", custom: true, visible: false },
    ipAddress: { label: "IP-адрес", custom: true, visible: true },
    streamer: { label: "Стример", custom: true, visible: true },
    preset: { label: "Пресет", custom: true, visible: true },
    dvr_depth: { label: "Архив", custom: true, visible: true },
    dvrLimit: { label: "Лимит DVR (дни)", custom: true, visible: false },
    dvrSpace: { label: "Пространство DVR", custom: true, visible: false },
});

const toggleColumn = (key) => {
    tableColumns.value[key].visible = !tableColumns.value[key].visible;
};

const resetColumns = () => {
    tableColumns.value['streamUrl'].visible = false;
    tableColumns.value['subStreamUrl'].visible = false;
    tableColumns.value['preset'].visible = true;
    tableColumns.value['dvr_depth'].visible = true;
    tableColumns.value['ipAddress'].visible = true;
    tableColumns.value['dvrLimit'].visible = false;
    tableColumns.value['streamer'].visible = true;
    tableColumns.value['dvrSpace'].visible = false;
};

</script>

<template>
    <div class="pageContent">
        <div class="toolbar">
            <h2 v-if="videos == null">Загрузка...</h2>
            <!-- <h2 v-if="errorMessage" class="error">{{ errorMessage }}</h2> -->
            <div class="buttons">
                <button class="button" @click="toggleColumnsMenu">📊 Столбцы</button>
                <div v-if="showColumnsMenu" class="dropdown-menu" ref="columnsMenu">
                    <div class="columns-container">
                        <template v-for="(column, key) in tableColumns" :key="key">
                            <button v-if="column.custom" class="dropdown-item" :class="{ active: column.visible }"
                                @click="toggleColumn(key)">
                                {{ column.label }}
                            </button>
                        </template>
                    </div>
                    <button class="reset-button" @click="resetColumns">🔄 Восстановить по умолчанию</button>
                </div>

                <button class="button" @click="toggleFilterMenu">🔍 Фильтр</button>
                <div v-if="showFilterMenu" class="dropdown-menu" ref="filterMenu">
                    <input class="input-field" type="text" placeholder="🔍 Поиск..." v-model="filter.search">
                    <input class="input-field" type="text" placeholder="Глубина DVR" v-model="filter.dvr_depth">
                    <input class="input-field" type="text" placeholder="Стример" v-model="filter.streamer">
                    <input class="input-field" type="text" placeholder="Организация" v-model="filter.organization_id">

                    <div class="checkbox-group">
                        <label><input type="checkbox" v-model="filter.dvr_enabled"> Архив</label>
                        <label><input type="checkbox" v-model="filter.agent"> Agent</label>
                        <label><input type="checkbox" v-model="filter.onvif"> ONVIF</label>
                        <label><input type="checkbox" v-model="filter.vision_enabled"> ANPR</label>
                        <label><input type="checkbox" v-model="filter.enabled"> Включена</label>
                    </div>
                    <button class="reset-button" @click="resetFilters">🧹 Очистить фильтры</button>
                </div>
            </div>
        </div>

        <table class="camera-table">
            <thead>
                <tr>
                    <template v-for="(column, key) in tableColumns" :key="key">
                        <th v-if="column.visible" :class="key">
                            {{ column.label }}
                        </th>
                    </template>
                </tr>
            </thead>
            <tbody>
                <tr v-for="video in videos" :key="video.name">
                    <template v-for="(column, key) in tableColumns" :key="key">
                        <!-- <td v-if="column.visible && key === 'status'" :class="key">
                            <span :class="['status-dot', getStatusClass(video.stream_status.alive)]"></span>
                        </td> -->

                        <td v-if="column.visible && key === 'name'" :class="key">
                            <span :class="['status-dot', getStatusClass(video.stream_status.alive)]"></span>
                            <nuxt-link :to="`/VideoPlayer/${video.name}`">
                                {{ video.title }}
                            </nuxt-link>
                        </td>

                        <td v-else-if="column.visible && key === 'streamUrl'" :class="key" :title="video.stream_url">
                            {{ video.stream_url }}
                        </td>

                        <td v-else-if="column.visible && key === 'subStreamUrl'" :class="key" :title="video.subкуьщеуstream_url">
                            {{ video.substream_url }}
                        </td>

                        <td v-else-if="column.visible && key === 'preset'" :class="key">
                            {{ video.preset.title }}
                        </td>

                        <td v-else-if="column.visible && key === 'dvr_depth'" :class="key">
                            {{ video.dvr_depth == 1 ? "1 day" : video.dvr_depth ? `${video.dvr_depth} days` : '' }}
                        </td>

                        <td v-else-if="column.visible && key === 'ipAddress'" :class="key">
                            {{ video.stream_url.match(regex)?.[1] }}
                        </td>

                        <td v-else-if="column.visible && key === 'dvrLimit'" :class="key">

                        </td>

                        <td v-else-if="column.visible && key === 'streamer'" :class="key">
                            {{ video.stream_status.server }}
                            <!-- нужно сделать через получение streamers и через id в streame_id -->
                        </td>

                        <td v-else-if="column.visible && key === 'dvrSpace'" :class="key">
                            {{ video.dvr_space }}
                        </td>
                    </template>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style scoped>
tbody {
    font-weight: 300;
}

.pageContent {
    padding: 20px;
    max-width: 100%;
    margin: 0 auto;
    background: white;
    border-radius: 8px;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
}

.toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

.buttons {
    display: flex;
    gap: 10px;
    margin-left: auto;
    position: relative;
}

.dropdown-menu {
    position: absolute;
    right: 0;
    top: 35px;
    background: white;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    min-width: 200px;
    z-index: 10;
}

.columns-container {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 5px;
}

.dropdown-item {
    padding: 8px;
    text-align: left;
    border: 1px solid #ccc;
    background: none;
    cursor: pointer;
    transition: 0.3s;
}

.dropdown-item.active {
    background: #007bff;
    color: white;
    border-color: #0056b3;
}

.input-field {
    width: 100%;
    padding: 5px;
    margin-bottom: 5px;
}

.checkbox-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.reset-button {
    margin-top: 10px;
    padding: 8px;
    background: white;
    border: none;
    cursor: pointer;
}

.button {
    padding: 8px 12px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: 0.3s;
}

.button:hover {
    background: #0056b3;
}

h2 {
    margin-bottom: 15px;
    text-align: center;
    color: #333;
}

.camera-table {
    margin-top: 20px;
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
}

.camera-table th,
.camera-table td {
    word-wrap: break-word;

    padding: 10px;
    text-align: left;
    border-bottom: 1px solid #ddd;
}

.camera-table th.name,
.camera-table td.name {
    display: flex;
    align-items: center;
    flex-wrap: nowrap;  /* Prevent the items from wrapping */
}

.camera-table th.streamUrl,
.camera-table td.streamUrl,
.camera-table th.subStreamUrl,
.camera-table td.subStreamUrl,
.camera-table th.streamer,
.camera-table td.streamerб
.camera-table th.name,
.camera-table td.name {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
}

.camera-table th {
    background: #f4f4f4;
}

.status-dot {
    display: inline-block;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    margin-right: 7px;
    flex-shrink: 0;
}

.status-green {
    background: green;
}

.status-red {
    background: red;
}

@media (max-width: 991px) {

    .camera-table th,
    .camera-table td {
        min-width: 80px;
    }

    .camera-table th:nth-child(4),
    .camera-table td:nth-child(4) {
        display: none;
    }
}




button {
    border: none;
    text-transform: uppercase;
    text-align: center;
    font-size: 13px;
    font-weight: 500;
    outline: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-family: inherit;
    text-decoration: none;
    position: relative;
    white-space: nowrap;
    transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;

    padding: 5px 16px;
    line-height: 16px;
    border-radius: 4px;
    background-color: transparent;
}

.error {
    color: red;
    margin-bottom: 20px;
}

ul {
    list-style: none;
    padding: 0;
}

li {
    margin-bottom: 10px;
}
</style>
