<script setup>
const apiUrl = useRuntimeConfig().public.API_BASE_URL ?? window.location.origin
const route = useRoute();
const router = useRouter();

const errorMessage = ref({});
const maxRetries = 5;
let retryCount = 0;

const user = ref({
    folders: [],
    organizations: [],
});
const organizations = ref([]);
const folders = ref([]);

const tab = ref('general')

const fetchUser = async () => {
    try {
        if (retryCount < maxRetries) {
            const { data } = await useFetch(`${apiUrl}/api/v1.0/users/${route.params.userId}`, {
                method: "GET",
                credentials: 'include',
            });

            // console.log(`Попытка ${retryCount + 1} (пользователь):`, data.value)

            if (!data.value) {
                retryCount++;
                console.warn(`Попытка ${retryCount}: Данные не загрузились, пробуем еще раз через 1 сек...`);
                setTimeout(fetchUser, 1000);
                return;
            }

            if (data.value.accessLevel === "Admin") {
                data.value.isAdmin = true;
                data.value.isReadOnly = false;
            } else if (data.value.accessLevel === "User") {
                data.value.isAdmin = false;
                data.value.isReadOnly = true;
            }

            user.value = data.value;

            selectedOrganizationIds.value = user.value.organizations
                .filter(org => org.isMember)
                .map(org => org.id);         

            user.value.organizations.forEach(async (org) => {
                await fetchFolder(org.id);
            });

            retryCount = 0
        } else {
            errorMessage.value = 'Превышено число попыток'
            console.error(errorMessage.value)
        }
    } catch (error) {
        errorMessage.value = 'Ошибка загрузки пользователя';
        console.error("Ошибка загрузки пользователя:", error);
    }
};


const fetchOrganizations = async () => {
	try {
		if (retryCount < maxRetries) {
			const { data } = await useFetch(`${apiUrl}/api/v1.0/organizations`, {
				method: "GET",
				credentials: 'include',
			});

			// console.log(`Попытка ${retryCount + 1} (организации):`, data.value)

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

const fetchFolder = async (orgId) => {
	try {
		if (retryCount < maxRetries) {
			const { data } = await useFetch(`${apiUrl}/api/v1.0/organizations/${orgId}/folders`, {
				method: "GET",
				credentials: 'include',
			});

			// console.log(`Попытка ${retryCount + 1} (папки):`, data.value);

			if (!data.value) {
				retryCount++;
				console.warn(`Попытка ${retryCount}: Данные не загрузились, пробуем еще раз через 1 сек...`);
				setTimeout(fetchFolder(orgId), 1000);
				return;
			}
            
            data.value.forEach(folder => {
                if (!user.value.folders.some(existingFolder => existingFolder.id === folder.id)) {
                    user.value.folders.push({id: folder.id, canView: true});
                }
                folders.value.push(folder)
            });

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
    await fetchUser();
	await fetchOrganizations();
});

const validateMaxSessions = (value) => {
    if (!value) {
        user.value.maxSessions = null;
        return true;
    }
    const parsedValue = parseInt(value, 10);
    if (!isNaN(parsedValue) && parsedValue > 0) {
        user.value.maxSessions = parsedValue;
        return true;
    }
    return false;
};

const isValid = computed(() => user.value.login);

const submitForm = async () => {
    if (isValid.value) {
		console.log('Отправка данных:', user.value);

		const { data, error, status } = await useFetch(`${apiUrl}/api/v1.0/users/${user.value.id}`, {
			method: "PUT",
			body: user.value,
			credentials: 'include',
		})

		console.log('Получение данных:', data.value, status)

		navigateTo('/users')
	} else {
		console.log('Заполните обязательные поля!');
	}
};

const cancel = () => {
    if (window.history.length > 1) {
		router.back();
	} else {
        navigateTo('/users')
	}
};

const selectedOrganizationIds = ref([]);

const updateUserOrganizations = async (selectedIds) => {
    user.value.organizations = selectedIds.map(id => {
        const existing = user.value.organizations.find(org => org.id === id);
        return existing || { id, isMember: true, isAdmin: false };
    });

    selectedOrganizationIds.value = selectedIds; // Обновляем v-model

    for (const orgId of selectedIds) {
        await fetchFolder(orgId);
    }
};

const deleteUser = async () => {
    const { data, error, status } = await useFetch(`${apiUrl}/api/v1.0/users/${user.value.id}`, {
        method: "DELETE",
        credentials: 'include',
    })
    
    navigateTo('/users')
}
</script>

<template>
    <v-container>
        <v-tabs v-model="tab" background-color="primary" dark>
            <v-tab value="general">Общие настройки</v-tab>
            <v-tab value="organization">Организации</v-tab>
            <v-tab value="cameras">Камеры</v-tab>
        </v-tabs>

        <v-window v-model="tab">
            <v-window-item value="general">
                <v-container class="d-flex justify-center align-center">
                    <v-sheet class="pa-4" width="1200" style="max-height: 90vh; overflow: auto;">
                        <v-form @submit.prevent="submitForm">
                            <v-row>
                                <v-col cols="6">
                                    <v-text-field v-model="user.login" label="Логин"
                                        :rules="[v => !!v || 'Обязательное поле']" required density="compact"
                                        outlined></v-text-field>
                                    <!-- <v-text-field v-model="user.password" label="Пароль" type="password"
                            :rules="[v => !!v || 'Обязательное поле']" required density="compact"
                            outlined></v-text-field> -->
                                    <v-text-field v-model="user.email" label="Email" density="compact"
                                        outlined></v-text-field>
                                    <v-text-field v-model="user.name" label="Имя" density="compact"
                                        outlined></v-text-field>
                                    <v-switch v-model="user.enabled" label="Включен" density="compact" outlined
                                        :class="{ 'switch-active': user.enabled }"></v-switch>
                                </v-col>
                                <v-col cols="6">
                                    <v-text-field v-model="user.phone" label="Телефон" density="compact"
                                        outlined></v-text-field>
                                    <v-text-field v-model="user.note" label="Описание" density="compact"
                                        outlined></v-text-field>
                                    <v-select v-model="selectedOrganizationIds" :items="organizations"
                                        item-title="title" item-value="id" label="Организация" multiple
                                        density="compact" outlined @update:modelValue="updateUserOrganizations">
                                    </v-select>
                                    <v-text-field v-model="user.maxSessions" label="Максимальное число сессий"
                                        type="text" density="compact" outlined placeholder="неограничено"
                                        :rules="[v => validateMaxSessions(v) || 'Должно быть положительное целое число']">
                                    </v-text-field>
                                </v-col>
                            </v-row>
                            <v-row class="align-center">
                                <v-col cols="12">
                                    <v-btn-toggle v-model="user.accessLevel" mandatory density="compact" outlined>
                                        <v-btn :value="'Admin'"
                                            :class="{ 'btn-active': user.accessLevel === 'Admin' }">Администратор</v-btn>
                                        <v-btn :value="'User'"
                                            :class="{ 'btn-active': user.accessLevel === 'User' }">Только
                                            для
                                            чтения</v-btn>
                                    </v-btn-toggle>
                                </v-col>
                                <v-col class="d-flex" cols="6">
                                    <v-btn type="submit" :disabled="!isValid" color="primary">Сохранить
                                        изменения</v-btn>
                                    <v-btn @click="cancel" class="ml-3">Отмена</v-btn>
                                </v-col>
                                <v-col class="d-flex justify-end" cols="6">
                                    <v-btn @click="deleteUser" color="red">Удалить пользователя</v-btn>
                                </v-col>
                            </v-row>
                        </v-form>
                    </v-sheet>
                </v-container>
            </v-window-item>

            <v-window-item value="organization">
                <v-container class="d-flex justify-center align-center">
                    <v-row v-if="user.organizations.length > 0">
                        <v-col cols="12">
                            <v-subheader>Добавленные организации</v-subheader>
                            <v-list dense>
                                <v-list-item-group v-for="org in user.organizations" :key="org.id">
                                    <v-list-item>
                                        <v-list-item-content>
                                            <v-row justify="space-between" align="center">
                                                <v-col cols="6">
                                                    <v-list-item-title>
                                                        {{ organizations.find(o => o.id === org.id)?.title }}
                                                    </v-list-item-title>
                                                </v-col>
                                                <v-col cols="6" class="d-flex justify-end">
                                                    <div class="d-flex align-center">
                                                        <v-switch v-model="org.isMember" label="Участник"
                                                            density="compact" hide-details class="mr-2"></v-switch>
                                                        <v-switch v-model="org.isAdmin" label="Администратор"
                                                            density="compact" hide-details></v-switch>
                                                    </div>
                                                </v-col>
                                            </v-row>
                                        </v-list-item-content>
                                    </v-list-item>
                                </v-list-item-group>
                            </v-list>
                        </v-col>
                    </v-row>
                </v-container>
            </v-window-item>

            <v-window-item value="cameras">
                <v-container class="d-flex justify-center align-center">
                    <v-row v-if="user.folders.length > 0">
                        <v-col cols="12">
                            <v-subheader>Доступ к камерам</v-subheader>
                            <v-list dense>
                                <v-list-item-group v-for="fld in user.folders" :key="fld.id">
                                    <v-list-item>
                                        <v-list-item-content>
                                            <v-row justify="space-between" align="center">
                                                <v-col cols="6">
                                                    <v-list-item-title>
                                                        {{ folders.find(f => f.id === fld.id)?.title }}
                                                    </v-list-item-title>
                                                </v-col>
                                                <v-col cols="6" class="d-flex justify-end">
                                                    <div class="d-flex align-center">
                                                        <v-switch v-model="fld.canView" label="Участник"
                                                            density="compact" hide-details class="mr-2"></v-switch>
                                                    </div>
                                                </v-col>
                                            </v-row>
                                        </v-list-item-content>
                                    </v-list-item>
                                </v-list-item-group>
                            </v-list>
                        </v-col>
                    </v-row>
                </v-container>
            </v-window-item>
        </v-window>
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
