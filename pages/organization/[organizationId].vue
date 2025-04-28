<script setup>
const apiUrl = useRuntimeConfig().public.API_BASE_URL ?? window.location.origin
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const errorMessage = ref({});
const maxRetries = 5;
let retryCount = 0;

const tab = ref('general')
const organization = ref({
    title: null,
    ownerId: authStore.id,
    limits: {
        cameraLimit: null,
        userLimit: null
    }
})

const cameraLimitValue = computed({
    get() {
        const val = organization.value.limits.cameraLimit;
        return val === 0 || val === null ? '' : val;
    },
    set(value) {
        const n = Number(value);
        organization.value.limits.cameraLimit = (value === '' || n === 0 ? null : n);
    }
});

const userLimitValue = computed({
    get() {
        const val = organization.value.limits.userLimit;
        return val === 0 || val === null ? '' : val;
    },
    set(value) {
        const n = Number(value);
        organization.value.limits.userLimit = value === '' || n === 0 ? null : n;
    }
});

const users = ref([])

// Подгружаем пользователей и текущего юзера
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

const fetchOrganization = async () => {
	try {
		if (retryCount < maxRetries) {
			const { data } = await useFetch(`${apiUrl}/api/v1.0/organizations/${route.params.organizationId}`, {
				method: "GET",
				credentials: 'include',
			});

			console.log(`Попытка ${retryCount + 1} (организации):`, data.value)

			if (!data.value) {
				retryCount++;
				console.warn(`Попытка ${retryCount}: Данные не загрузились, пробуем еще раз через 1 сек...`);
				setTimeout(fetchOrganization, 1000);
				return;
			}

            data.value.limits.cameraLimit = data.value.limits.cameraLimit === 0 ? null : data.value.limits.cameraLimit;
			data.value.limits.userLimit = data.value.limits.userLimit === 0 ? null : data.value.limits.userLimit;

			organization.value = data.value
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
    await fetchOrganization()
    await fetchUsers()
})

const validateLimit = (val) => {
    if (val === '' || val === null) return true
    const n = Number(val)
    return !isNaN(n) && n >= 0
}

const isValid = computed(() => !!organization.value.title && !!organization.value.ownerId)

const submitForm = async () => {
    if (isValid.value) {
		console.log('Отправка данных:', organization.value);

		const { data, error, status } = await useFetch(`${apiUrl}/api/v1.0/organizations/${organization.value.id}`, {
			method: "PUT",
			body: user.value,
			credentials: 'include',
		})

		console.log('Получение данных:', data.value, status)

		navigateTo('/organizations')
	} else {
		console.log('Заполните обязательные поля!');
	}
}

const cancel = () => {
	navigateTo('/organizations')
}

const deleteOrg = async () => {
    const { data, error, status } = await useFetch(`${apiUrl}/api/v1.0/organizations/${organization.value.id}`, {
        method: "DELETE",
        credentials: 'include',
    })
    
    navigateTo('/organizations')
}


</script>

<template>
    <v-container>
        <v-tabs v-model="tab" background-color="primary" dark>
            <v-tab value="general">Общие настройки</v-tab>
            <v-tab value="cameras">Камеры</v-tab>
            <v-tab value="users">Пользователи</v-tab>
            <v-tab value="mosaics">Мозаики</v-tab>
        </v-tabs>

        <v-window v-model="tab">
            <v-window-item value="general">
                <v-container class="d-flex justify-center align-center">
                    <v-sheet class="pa-4" width="100%" style="max-height: 90vh; overflow: auto;">
                        <v-form @submit.prevent="submitForm">
                            <v-row>
                                <v-col cols="12">
                                    <v-text-field v-model="organization.title" label="Название организации"
                                        :rules="[v => !!v || 'Обязательное поле']" required density="compact"
                                        outlined />
                                    <v-select v-model="organization.ownerId" :items="users" item-title="login"
                                        item-value="id" label="Владелец" :rules="[v => !!v || 'Обязательное поле']"
                                        required density="compact" outlined />
                                    <v-text-field v-model="organization.limits.cameraLimit" label="Лимит камер"
                                        :rules="[v => validateLimit(v) || 'Должно быть положительное число']"
                                        density="compact" outlined
                                        :display-value="cameraLimitValue === '' ? 'неограниченно' : undefined" />
                                    <v-text-field v-model="organization.limits.userLimit" label="Лимит пользователей"
                                        :rules="[v => validateLimit(v) || 'Должно быть положительное число']"
                                        density="compact" outlined
                                        :display-value="userLimitValue === '' ? 'неограниченно' : undefined" />
                                </v-col>
                            </v-row>
                            <v-row class="align-center">
                                <v-col class="d-flex" cols="6">
                                    <v-btn type="submit" :disabled="!isValid" color="primary">Сохранить
                                        изменения</v-btn>
                                    <v-btn @click="cancel" class="ml-3">Отмена</v-btn>
                                </v-col>
                                <v-col class="d-flex justify-end" cols="6">
                                    <v-btn @click="deleteOrg" color="red">Удалить организацию</v-btn>
                                </v-col>
                            </v-row>
                        </v-form>
                    </v-sheet>
                </v-container>
            </v-window-item>

            <v-window-item value="cameras">
                <v-container>
                    <CamerasTable :organization="route.params.organizationId" />
                </v-container>
            </v-window-item>

            <v-window-item value="users">
                <v-container>
                    <UsersTable :organization="route.params.organizationId" />
                </v-container>
            </v-window-item>

            <v-window-item value="mosaics">
                <v-container>
                    <!-- Мозаики -->
                    <v-alert type="info">Мозаики здесь</v-alert>
                </v-container>
            </v-window-item>
        </v-window>
    </v-container>
</template>

<style scoped>
</style>
