<script setup>
const props = defineProps({
    organization: String,
});

const apiUrl = useRuntimeConfig().public.API_BASE_URL ?? window.location.origin
const errorMessage = ref('');
const maxRetries = 5;
let retryCount = 0;

const mosaics = ref([]);
const organizations = ref([]);

const fetchMosaics = async () => {
    try {
        if (retryCount < maxRetries) {
            const { data } = await useFetch(`${apiUrl}/api/v1.0/mosaics?organizationId=${props.organization}`, {
                method: "GET",
                credentials: 'include',
            });

            console.log(`Попытка ${retryCount + 1} (мозаики):`, data.value)

            if (!data.value) {
                retryCount++;
                console.warn(`Попытка ${retryCount}: Данные не загрузились, пробуем еще раз через 1 сек...`);
                setTimeout(fetchMosaics, 1000);
                return;
            }

            mosaics.value = data.value;

            retryCount = 0
        } else {
            errorMessage.value = 'Превышено число попыток'
            console.error(errorMessage.value)
        }
    } catch (error) {
        errorMessage.value = 'Ошибка загрузки мозаик';
        console.error("Ошибка загрузки мозаик:", error);
    }
};

const fetchOrganizations = async () => {
    try {
        if (retryCount < maxRetries) {
            const { data } = await useFetch(`${apiUrl}/api/v1.0/organizations`, {
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

onMounted(async () => {
    await fetchMosaics();
    await fetchOrganizations();
});

const filteredMosaics = computed(() => {
    return mosaics.value.filter(mosaic =>
        (!filter.value.search || mosaic.title.toLowerCase().includes(filter.value.search.toLowerCase())) &&
        (!filter.value.organizationId || mosaic.organizationId === filter.value.organizationId)
    );
});

const filterMenu = ref(null);
const showFilterMenu = ref(false);
const filter = ref({ search: '', organizationId: '' });


const handleClickOutside = (event) => {
    if (filterMenu.value && !filterMenu.value.contains(event.target) && !event.target.closest('.buttons')) {
        showFilterMenu.value = false;
    }
};

const toggleFilterMenu = () => {
    showFilterMenu.value = !showFilterMenu.value;
};

const resetFilters = () => {
    filter.value = {
        search: "",
        organizationId: "",
    };
};

onMounted(() => {
    document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
});

const createMosaic = () => {
    navigateTo({ path: '/createMosaic', query: { defaultOrg: props.organization } })
}

const deleteMosaic = async (mosaic) => {
    const { data, error, status } = await useFetch(`${apiUrl}/api/v1.0/mosaics/${mosaic.id}`, {
        method: "DELETE",
        credentials: 'include',
    })

    await fetchMosaics();
}

</script>

<template>
    <div class="pageContent">
        <div class="toolbar">
            <h2 v-if="mosaics.length === 0">Загрузка...</h2>
            <div class="buttons">
                <button class="button" v-if="organization !== ''" @click="createMosaic">Создать Мозаику</button>
                <button class="button" @click="toggleFilterMenu">🔍 Фильтр</button>
                <div v-if="showFilterMenu" class="dropdown-menu" ref="filterMenu">
                    <input class="input-field" type="text" placeholder="🔍 Поиск..." v-model="filter.search">
                    <button class="reset-button" @click="resetFilters">🧹 Очистить фильтры</button>
                </div>
            </div>
        </div>

        <table class="mosaics-table">
            <thead>
                <tr>
                    <th class="wide-column align-left">Название</th>
                    <th class="narrow-column">Организация</th>
                    <th class="narrow-column">Тип</th>
                    <th class="narrow-column" v-if="organization !== ''" >Действия</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="mosaic in filteredMosaics" :key="mosaic.id">
                    <td class="wide-column">
                        <nuxt-link :to="`/mosaic/${mosaic.id}`">
                            {{ mosaic.title }}
                        </nuxt-link>
                    </td>
                    <td class="narrow-column">
                        <nuxt-link :to="`/organization/${mosaic.organizationId}`">
                            {{ organizations.find(org => org.id === mosaic.organizationId)?.title ?? 'Неизвестно' }}
                        </nuxt-link>
                    </td>
                    <td class="narrow-column">
                        {{ mosaic.type }}
                    </td>
                    <td class="narrow-column" v-if="organization !== ''">
                        <button @click="deleteMosaic(mosaic)" class="delete-button">Удалить</button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style>
.mosaics-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}


.mosaics-table th,
.mosaics-table td {
    word-wrap: break-word;
    width: 10%;
    padding: 10px;
    border-bottom: 1px solid #ddd;
}

.dropdown-menu {
    position: absolute;
    background: white;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    max-width: 100px;
    max-height: 300px;
    overflow-y: auto;
    z-index: 10;
}

.dropdown-menu ul {
    list-style: none;
    padding: 0;
}

.dropdown-menu li {
    margin-bottom: 10px;
}

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

.wide-column {
    width: 40%;
}

.narrow-column {
    width: 10%;
    text-align: center;
}

.align-left {
    text-align: left;
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

.reset-button {
    margin-top: 10px;
    padding: 8px;
    background: white;
    border: none;
    cursor: pointer;
}

.delete-button {
    background: red;
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
</style>
