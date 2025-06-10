<script setup>
const apiUrl = useRuntimeConfig().public.API_BASE_URL ?? window.location.origin

definePageMeta({
    title: 'Организации',
});

const maxRetries = 3;
let retryCount = 0;
const errorMessage = ref({});

const organizations = ref([]);
const users = ref([]);

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

const fetchUsers = async () => {
    try {
        if (retryCount < maxRetries) {
            const { data } = await useFetch(`${apiUrl}/api/v1.0/users`, {
                method: "GET",
                credentials: 'include',
            });

            console.log(`Попытка ${retryCount + 1} (пользователи):`, data.value)

            if (!data.value) {
                retryCount++;
                console.warn(`Попытка ${retryCount}: Данные не загрузились, пробуем еще раз через 1 сек...`);
                setTimeout(fetchUsers, 1000);
                return;
            }

            data.value.forEach(u => {
                if (u.accessLevel === "Admin") {
                u.isAdmin = true;
                u.isReadOnly = false;
            } else if (u.accessLevel === "User") {
                u.isAdmin = false;
                u.isReadOnly = true;
            }
            });

            users.value = data.value;

            retryCount = 0
        } else {
            errorMessage.value = 'Превышено число попыток'
            console.error(errorMessage.value)
        }
    } catch (error) {
        errorMessage.value = 'Ошибка загрузки пользователей';
        console.error("Ошибка загрузки пользователей:", error);
    }
};

onMounted(async () => {
    await fetchOrganizations();
    await fetchUsers();
});

const filteredOrganizations = computed(() => {
    return organizations.value.filter(org =>
        (!filters.value.name || org.title.toLowerCase().includes(filters.value.name.toLowerCase())) &&
        (!filters.value.owner || org.ownerId === filters.value.owner) &&
        (!filters.value.minCameras || org.cameraCount >= filters.value.minCameras) &&
        (!filters.value.maxCameras || org.cameraCount <= filters.value.maxCameras) &&
        (!filters.value.minUsers || org.userCount >= filters.value.minUsers) &&
        (!filters.value.maxUsers || org.userCount <= filters.value.maxUsers)
    );
});

const filters = ref({
    name: '',
    owner: '',
    minCameras: '',
    maxCameras: '',
    minUsers: '',
    maxUsers: ''
});

const showFilterMenu = ref(false);
const filterMenu = ref(null);

const toggleFilterMenu = () => {
    showFilterMenu.value = !showFilterMenu.value;
};

const resetFilters = () => {
    filters.value = {
        name: '',
        owner: '',
        minCameras: '',
        maxCameras: '',
        minUsers: '',
        maxUsers: ''
    };
};

const handleClickOutside = (event) => {
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

const addOrganization = () => {
    navigateTo('/createOrganization')
}
</script>

<template>
    <div class="pageContent">
        <div class="toolbar">
            <h2 v-if="organizations.length === 0">Загрузка...</h2>
            <div class="buttons">
                <button class="button" @click="addOrganization">Добавить организацию</button>
                <button class="button" @click="toggleFilterMenu">🔍 Фильтр</button>
                <div v-if="showFilterMenu" class="dropdown-menu" ref="filterMenu">
                    <input class="input-field" type="text" placeholder="Название..." v-model="filters.name" />
                    <input class="input-field" type="text" placeholder="Администратор..." v-model="filters.owner" />
                    <input class="input-field" type="number" placeholder="Камеры от..."
                        v-model.number="filters.minCameras" />
                    <input class="input-field" type="number" placeholder="Камеры до..."
                        v-model.number="filters.maxCameras" />
                    <input class="input-field" type="number" placeholder="Пользователи от..."
                        v-model.number="filters.minUsers" />
                    <input class="input-field" type="number" placeholder="Пользователи до..."
                        v-model.number="filters.maxUsers" />
                    <button class="reset-button" @click="resetFilters">🧹 Очистить фильтры</button>
                </div>
            </div>
        </div>

        <table class="org-table">
            <thead>
                <tr>
                    <th class="wide-column align-left">Организация</th>
                    <th class="wide-column align-left">Администратор</th>
                    <th class="narrow-column">Камеры</th>
                    <th class="narrow-column">Мозаики</th>
                    <th class="narrow-column">Пользователи</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="org in filteredOrganizations" :key="org.id">
                    <td class="wide-column">
                        <nuxt-link :to="`/organization/${org.id}`">
                            {{ org.title }}
                        </nuxt-link>
                    </td>
                    <td class="wide-column">{{ users.find(u => u.id === org.ownerId)?.login }}</td>
                    <td class="narrow-column">{{ org.stats.cameraCount }} / {{ org.limits.cameraLimit ?? "-"}}</td>
                    <td class="narrow-column">{{ org.stats.mosaicCount }}</td>
                    <td class="narrow-column">{{ org.stats.userCount }} / {{ org.limits.userLimit ?? "-"}}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style scoped>
.org-table {
    border-collapse: separate;
}

.org-table th,
.org-table td {
    word-wrap: break-word;
    width: 10%;
    padding: 10px;
    text-align: left;
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
    width: 30%;
}

.narrow-column {
    width: 20%;
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