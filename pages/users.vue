<script setup>
const users = ref([]);

definePageMeta({
    title: 'Пользователи',
});

const organizations = ref([]);
const selectedOrganizations = ref([]);
const organizationsMenuStyle = ref({ top: '0px', left: '0px' });

const maxRetries = 3;
let retryCount = 0;
const errorMessage = ref({});

const apiUrl = useRuntimeConfig().public.API_BASE_URL ?? window.location.origin

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
    await fetchUsers();
    await fetchOrganizations();
});

const filteredUsers = computed(() => {
    return users.value.filter(user =>
        (!filter.value.search || user.login.includes(filter.value.search)) &&
        (!filter.value.organizationId || user.organizations.some(org => org.id === filter.value.organizationId))
    );
});

const organizationsMenu = ref(null);
const showOrganizationsMenu = ref(false);

const filterMenu = ref(null);
const showFilterMenu = ref(false);
const filter = ref({ search: '', organizationId: '' });

const toggleOrganizationsMenu = (event, userOrganizations) => {
    selectedOrganizations.value = userOrganizations.map(org => organizations.value.find(o => o.id === org.id));
    //selectedOrganizations.value = [{ id: 1, title: "Org1" }, { id: 2, title: "Org2" }, { id: 3, title: "Org3" }, { id: 4, title: "Org4" }, { id: 1, title: "Org1" }, { id: 2, title: "Org2" }, { id: 3, title: "Org3" }, { id: 4, title: "Org4" }, { id: 1, title: "Org1" }, { id: 2, title: "Org2" }, { id: 3, title: "Org3" }, { id: 4, title: "Org4" }, { id: 1, title: "Org1" }, { id: 2, title: "Org2" }, { id: 3, title: "Org3" }, { id: 4, title: "Org4" }, { id: 1, title: "Org1" }, { id: 2, title: "Org2" }, { id: 3, title: "Org3" }, { id: 4, title: "Org4" }]
    showOrganizationsMenu.value = !showOrganizationsMenu.value;
    if (showOrganizationsMenu.value) {
        nextTick(() => {
            const rect = event.target.getBoundingClientRect();
            organizationsMenuStyle.value = {
                top: `${rect.bottom + window.scrollY - 80}px`,
                left: `${rect.left + window.scrollX - 80}px`
            };
        });
    }
};

const getOrganizationTitle = (userOrganizations) => {
    const org = organizations.value.find(org => userOrganizations.some(o => o.id === org.id));
    return org ? org.title : 'Нет организаций';
};

const handleClickOutside = (event) => {
    if (Array.isArray(organizationsMenu.value)) {
        if (organizationsMenu.value[0] && !organizationsMenu.value[0].contains(event.target) && !event.target.closest('.org-button')) {
            showOrganizationsMenu.value = false;
        }
    } else if (organizationsMenu.value && !organizationsMenu.value.contains(event.target) && !event.target.closest('.org-button')) {
        showOrganizationsMenu.value = false;
    }

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

const showMessageModal = ref(false);
const messageForm = ref({
    userId: null,
    title: '',
    body: '',
    type: 'info',
    isPush: true,
    isDashboard: true
});

const openMessageModal = (user) => {
    messageForm.value = {
        userId: user.id,
        title: '',
        body: '',
        type: 'info',
        isPush: true,
        isDashboard: true
    };
    showMessageModal.value = true;
};

const closeMessageModal = () => {
    showMessageModal.value = false;
};

const sendMessageToUser = async () => {
    try {
        const { error } = await useFetch(`${apiUrl}/api/v1.0/messages`, {
            method: 'POST',
            body: messageForm.value,
            credentials: 'include'
        });

        if (!error.value) {
            // alert('Сообщение отправлено');
            closeMessageModal();
        } else {
            alert('Ошибка при отправке сообщения');
        }
    } catch (err) {
        console.error('Ошибка отправки:', err);
        alert('Ошибка при отправке сообщения');
    }
};

onMounted(() => {
    document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
});

const addUser = () => {
    navigateTo('/createUser')
}

</script>

<template>
    <div class="pageContent">
        <div class="toolbar">
            <h2 v-if="users.length === 0">Загрузка...</h2>
            <div class="buttons">
                <button class="button" @click="addUser">Добавить пользавателя</button>
                <button class="button" @click="toggleFilterMenu">🔍 Фильтр</button>
                <div v-if="showFilterMenu" class="dropdown-menu" ref="filterMenu">
                    <input class="input-field" type="text" placeholder="🔍 Поиск..." v-model="filter.search">
                    <select v-model="filter.organizationId" class="input-field">
                        <option value="">Выберите организацию</option>
                        <option v-for="org in organizations" :key="org.id" :value="org.id">
                            {{ org.title }}
                        </option>
                    </select>
                    <button class="reset-button" @click="resetFilters">🧹 Очистить фильтры</button>
                </div>
            </div>
        </div>

        <table class="users-table">
            <thead>
                <tr>
                    <th class="wide-column align-left">Пользователь</th>
                    <th class="wide-column align-left">Организации</th>
                    <th class="narrow-column">Админ</th>
                    <th class="narrow-column">Только для чтения</th>
                    <th class="narrow-column">Действия</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="user in filteredUsers" :key="user.id">
                    <td class="wide-column">
                        <nuxt-link :to="`/user/${user.id}`">
                            {{ user.login }}
                        </nuxt-link>
                    </td>
                    <td class="wide-column">
                        <button class="org-button" @click="toggleOrganizationsMenu($event, user.organizations)">{{
                            getOrganizationTitle(user.organizations) }}...</button>
                        <div v-if="showOrganizationsMenu" class="dropdown-menu organizations-menu"
                            ref="organizationsMenu" :style="organizationsMenuStyle">
                            <h3 class="menu-title">Организации</h3>
                            <ul>
                                <li v-for="org in selectedOrganizations" :key="org.id" class="menu-item">
                                    <nuxt-link :to="`/organization/${org.id}`">
                                        {{ org.title }}
                                    </nuxt-link>
                                </li>
                            </ul>
                        </div>
                    </td>
                    <td class="narrow-column">
                        <input type="checkbox" :checked="user.isAdmin" disabled>
                    </td>
                    <td class="narrow-column">
                        <input type="checkbox" :checked="user.isReadOnly" disabled>
                    </td>
                    <td class="narrow-column">
                        <button @click="openMessageModal(user)" class="message-button">Сообщение</button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    <div v-if="showMessageModal" class="modal-overlay">
        <div class="modal-content">
            <h3>Отправка сообщения</h3>
            <label>Заголовок</label>
            <input v-model="messageForm.title" class="input-field" placeholder="Заголовок" />

            <label>Текст</label>
            <textarea v-model="messageForm.body" class="input-field" placeholder="Текст сообщения"></textarea>

            <label>Тип</label>
            <select v-model="messageForm.type" class="input-field">
                <option value="info">Информация</option>
                <option value="warning">Предупреждение</option>
                <option value="error">Ошибка</option>
            </select>

            <div class="checkbox-row">
                <label>
                    <input type="checkbox" v-model="messageForm.isPush" />
                    Push
                </label>
                <label>
                    <input type="checkbox" v-model="messageForm.isDashboard" />
                    Dashboard
                </label>
            </div>

            <div class="modal-actions">
                <button class="button" @click="sendMessageToUser">Отправить</button>
                <button class="button" @click="closeMessageModal">Отмена</button>
            </div>
        </div>
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
    margin: 0;
}

.dropdown-menu li {
    margin-bottom: 10px;
}

.organizations-menu {
    min-width: 220px;
    max-width: 300px;
    max-height: 300px;
    padding: 15px;
    border-radius: 8px;
    background: #fafafa;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    animation: fadeIn 0.3s ease;
}

.menu-title {
    margin-bottom: 10px;
    font-size: 18px;
    font-weight: 600;
    color: #333;
    text-align: center;
}

.menu-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.menu-item {
    padding: 8px 10px;
    margin-bottom: 5px;
    border-radius: 6px;
    transition: background 0.2s;
    cursor: default;
    font-size: 14px;
    color: #555;
}

.menu-item:hover {
    background: #e0e0e0;
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

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 20;
}

.modal-content {
    background: white;
    padding: 20px;
    border-radius: 10px;
    width: 600px;
    max-width: 90%;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.modal-content h3 {
    margin-bottom: 15px;
}

.modal-content textarea {
    min-height: 80px;
    resize: vertical;
}

.modal-actions {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}

.checkbox-row {
    display: flex;
    gap: 30px;
    align-items: center;
    margin-bottom: 1rem;
}

.checkbox-row label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    cursor: pointer;
}

.checkbox-row input[type="checkbox"] {
    vertical-align: middle;
    transform: translateY(-5px);
}
</style>