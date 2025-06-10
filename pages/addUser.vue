<script setup>
const route = useRoute();
const router = useRouter();

const apiUrl = useRuntimeConfig().public.API_BASE_URL ?? window.location.origin

definePageMeta({
    title: 'Добавление пользователя',
});

const users = ref([]);
const userMemberships = ref({});

const maxRetries = 3;
let retryCount = 0;
const errorMessage = ref({});

const fetchUsers = async () => {
    try {
        if (retryCount < maxRetries) {
            let url = `${apiUrl}/api/v1.0/users`;
            // if (props.organization !== '') {
            //     url = `${apiUrl}/api/v1.0/organizations/${props.organization}/users`
            // }

            const { data } = await useFetch(url, {
                method: "GET",
                credentials: 'include',
            });

            // console.log(`Попытка ${retryCount + 1} (пользователи):`, data.value)

            if (!data.value) {
                retryCount++;
                console.warn(`Попытка ${retryCount}: Данные не загрузились, пробуем еще раз через 1 сек...`);
                setTimeout(fetchUsers, 1000);
                return;
            }

            users.value = data.value;

            userMemberships.value = {};
            users.value.forEach(user => {
                const org = user.organizations.find(o => o.id === Number(route.query.defaultOrg));
                userMemberships.value[user.id] = {
                    initial: org ? org.isMember : false, // как было изначально
                    current: org ? org.isMember : false,  // текущее состояние чекбокса
                };
            });

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
    await fetchUsers();
});

const filteredUsers = computed(() => {
    return users.value.filter(user =>
        (!filter.value.search || user.login.includes(filter.value.search))
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

const getUserOrganizationIsMember = (user) => {
    return userMemberships.value[user.id]?.current ?? false;
};

const isUserInitiallyMember = (user) => {
    return userMemberships.value[user.id]?.initial ?? false;
};

const toggleUserOrganizationIsMember = (user, value) => {
    if (!isUserInitiallyMember(user)) { // только если пользователь НЕ был изначально
        userMemberships.value[user.id].current = value;
    }
};


const saveChanges = async () => {
    const usersToAdd = Object.entries(userMemberships.value)
        .filter(([_, membership]) => !membership.initial && membership.current);

    for (const [userId] of usersToAdd) {
        try {
            await useFetch(`${apiUrl}/api/v1.0/organizations/${route.query.defaultOrg}/users/${userId}`, {
                method: "PUT",
                credentials: 'include',
                body: JSON.stringify({
                    isMember: true
                }),
            });
            console.log(`Пользователь ${userId} успешно добавлен.`);
        } catch (error) {
            console.error(`Ошибка при добавлении пользователя ${userId}:`, error);
        }
    }

    cancel();


    // const { data, error, status } = await useFetch(`${apiUrl}/api/v1.0/organizations/${organization.value.id}`, {
    //     method: "PUT",
    //     body: user.value,
    //     credentials: 'include',
    // })
}

const cancel = () => {
    if (window.history.length > 1) {
        router.back();
    } else {
        navigateTo(`/organization/${route.query.defaultOrg}`)
    }
}


</script>

<template>
    <div class="pageContent">
        <div class="toolbar">
            <h2 v-if="users.length === 0">Загрузка...</h2>
            <div class="buttons">
                <button class="button" @click="saveChanges">Сохранить</button>
                <button class="button" @click="cancel">Отменить</button>
                <button class="button" @click="toggleFilterMenu">🔍 Фильтр</button>
                <div v-if="showFilterMenu" class="dropdown-menu" ref="filterMenu">
                    <input class="input-field" type="text" placeholder="🔍 Поиск..." v-model="filter.search">
                    <button class="reset-button" @click="resetFilters">🧹 Очистить фильтры</button>
                </div>
            </div>
        </div>

        <table class="users-table">
            <thead>
                <tr>
                    <th class="wide-column align-left">Пользователь</th>
                    <th class="narrow-column">Участник</th>
                    <th class="narrow-column">EMAIL</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="user in filteredUsers" :key="user.id">
                    <td class="wide-column">
                        {{ user.login }}
                    </td>
                    <td class="narrow-column">
                        <input type="checkbox" :checked="getUserOrganizationIsMember(user)"
                            :disabled="isUserInitiallyMember(user)"
                            @change="toggleUserOrganizationIsMember(user, $event.target.checked)">
                    </td>
                    <td class="narrow-column">
                        {{ user.email }}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style scoped>
.users-table {
    border-collapse: collapse;
}

.users-table th,
.users-table td {
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