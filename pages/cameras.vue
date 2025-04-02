<script setup>

definePageMeta({
    title: 'Камеры',
})

const videos = ref([]);
const organizations = ref([]);
const folders = ref([]);
const streamers = ref([]);
const errorMessage = ref('');
const maxRetries = 5;
let retryCount = 0;

const dvrDepthList = ref([
    // { title: 'Любой', value: '' },
    // { title: 'По движению', value: '0.125' },
    { title: '1 день', value: '1' },
    { title: '2 дня', value: '2' },
    { title: '3 дня', value: '3' },
    { title: '4 дня', value: '4' },
    { title: '5 дней', value: '5' },
    { title: '6 дней', value: '6' },
    { title: '1 неделя', value: '7' },
    { title: '10 дней', value: '10' },
    { title: '2 недели', value: '14' },
    { title: '1 месяц', value: '30' },
    { title: '40 дней', value: '40' },
    { title: '2 месяца', value: '60' },
    { title: '3 месяца', value: '90' },
    { title: '6 месяцев', value: '180' },
    { title: '1 год', value: '365' },
])

const filter = ref({
    search: '',
    dvrDepth: '',
    streamer: '',
    organizationId: '',
    dvrEnabled: false,
    agent: false,
    onvif: false,
    visionEnabled: false,
    enabled: false,
    limit: 1000,
});

const resetFilters = () => {
    filter.value = {
        search: '',
        dvrDepth: '',
        streamer: '',
        organizationId: '',
        dvrEnabled: false,
        agent: false,
        onvif: false,
        visionEnabled: false,
        enabled: false,
        limit: 1000,
    };
};

const queryFilter = {
    limit: 1000,
    sort: 'name',
}

const apiUrl = useRuntimeConfig().public.API_BASE_URL ?? window.location.origin

const fetchStreamers = async () => {
    try {
        if (retryCount < maxRetries) {
            const { data, error, status } = await useFetch(`${apiUrl}/api/v1.0/streamers`, {
                method: "GET",
                credentials: 'include',
            });

            console.log(`Попытка ${retryCount + 1} (стримеры):`, data.value);

            if (!data.value) {
                retryCount++;
                console.warn(`Попытка ${retryCount}: Данные не загрузились, пробуем еще раз через 1 сек...`);
                setTimeout(fetchVideos, 1000);
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

const fetchVideos = async () => {
    try {
        if (retryCount < maxRetries) {
            const { data, error, status } = await useFetch(`${apiUrl}/api/v1.0/cameras`, {
                method: "GET",
                credentials: 'include',
            });

            console.log(`Попытка ${retryCount + 1} (камеры):`, data.value);

            if (!data.value) {
                retryCount++;
                console.warn(`Попытка ${retryCount}: Данные не загрузились, пробуем еще раз через 1 сек...`);
                setTimeout(fetchVideos, 1000);
                return;
            }

            data.value.forEach(s => {
                const token = s.playbackConfig.token;
                s.previewUrl = `${streamers.value[0].apiUrl}/${s.name}/preview.jpg?token=${token}`;
                s.videoUrl = `${streamers.value[0].apiUrl}/${s.name}/index.m3u8?token=${token}`;
                //s.streamUrl = `${s.stream_url}?token=${token}`
            });

            videos.value = data.value
            retryCount = 0
        } else {
            errorMessage.value = 'Превышено число попыток'
            console.error(errorMessage.value)
        }

    } catch (error) {
        errorMessage.value = 'Ошибка загрузки видео';
        console.error('Ошибка загрузки видео:', error);
    }
};

const fetchOrganizations = async () => {
    try {
        if (retryCount < maxRetries) {
            const { data, error, status } = await useFetch(`${apiUrl}/api/v1.0/organizations`, {
                method: "GET",
                credentials: 'include',
            });

            console.log(`Попытка ${retryCount + 1} (организации):`, data.value)

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
            const { data, error, status } = await useFetch(`${apiUrl}/api/v1.0/folders`, {
                method: "GET",
                credentials: 'include',
            });

            console.log(`Попытка ${retryCount + 1} (папки):`, data.value);

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

const buildFolderTree = (folders, videos, organizations) => {
    const folderMap = new Map();
    const folderTree = [];

    folders.forEach(folder => {
        folderMap.set(folder.id, {
            ...folder,
            organizationName: organizations.find(org => org.id === folder.organizationId)?.title || 'Undefined',
            cameras: videos.filter(video => video.folderId === folder.id),
            children: [],
            isOpen: true,
        });
    });

    folderMap.forEach((folder, id) => {
        if (folder.parentId && folderMap.has(folder.parentId)) {
            folderMap.get(folder.parentId).children.push(folder);
        } else {
            folderTree.push(folder);
        }
    });

    const removeEmptyFolders = (folders) => {
        return folders.filter(folder => {
            folder.children = removeEmptyFolders(folder.children);

            return folder.children.length > 0 || folder.cameras.length > 0;
        });
    };

    return removeEmptyFolders(folderTree)
        .sort((a, b) => a.organizationName.localeCompare(b.organizationName));
};


const folderTree = computed(() => buildFolderTree(folders.value, videos.value, organizations.value));

onMounted(async () => {
    await fetchStreamers();
    await fetchVideos();
    await fetchOrganizations();
    await fetchFolders();
});

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
    dvrDepth: { label: "Архив", custom: true, visible: true },
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
    tableColumns.value['dvrDepth'].visible = true;
    tableColumns.value['ipAddress'].visible = true;
    tableColumns.value['dvrLimit'].visible = false;
    tableColumns.value['streamer'].visible = true;
    tableColumns.value['dvrSpace'].visible = false;
};

const addCamera = () => {
    navigateTo('/addCamera')
}

</script>

<template>
    <div class="pageContent">
        <div class="toolbar">
            <h2 v-if="videos == null">Загрузка...</h2>
            <!-- <h2 v-if="errorMessage" class="error">{{ errorMessage }}</h2> -->
            <div class="buttons">
                <button class="button" @click="addCamera">Добавить камеру</button>
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
                    <select v-model="filter.dvrDepth" class="input-field">
                        <option value="">Глубина DVR</option>
                        <option v-for="dvrDepth in dvrDepthList" :key="dvrDepth.value" :value="dvrDepth.value">
                            {{ dvrDepth.title }}
                        </option>
                    </select>
                    <input class="input-field" type="text" placeholder="Стример" v-model="filter.streamer">
                    <select v-model="filter.organizationId" class="input-field">
                        <option value="">Выберите организацию</option>
                        <option v-for="org in organizations" :key="org.id" :value="org.id">
                            {{ org.title }}
                        </option>
                    </select>

                    <div class="checkbox-group">
                        <label><input type="checkbox" v-model="filter.dvrEnabled"> Архив</label>
                        <label><input type="checkbox" v-model="filter.agent"> Agent</label>
                        <label><input type="checkbox" v-model="filter.onvif"> ONVIF</label>
                        <label><input type="checkbox" v-model="filter.visionEnabled"> ANPR</label>
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
                <template v-for="folder in folderTree" :key="folder.id">
                    <FolderRow :folder="folder" :level="0" :tableColumns="tableColumns" :streamers="streamers" />
                </template>

            </tbody>
        </table>
    </div>
</template>

<style>
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
}

.folder-row td {
    background: #d9eafc;
    font-weight: bold;
    text-align: left;
    padding: 12px;
}

.camera-table th,
.camera-table td {
    word-wrap: break-word;
    width: 10%;
    padding: 10px;
    text-align: left;
    border-bottom: 1px solid #ddd;
}

.camera-table th.name,
.camera-table td.name {
    width: 20%;
    align-items: center;
    flex-wrap: nowrap;
    /* Prevent the items from wrapping */
}

.camera-table th.streamUrl,
.camera-table td.streamUrl,
.camera-table th.subStreamUrl,
.camera-table td.subStreamUrl,
.camera-table th.streamer,
.camera-table td.streamerб .camera-table th.name,
.camera-table td.name {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    max-width: 100px;
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
