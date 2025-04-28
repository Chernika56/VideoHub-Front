<script setup>
const apiUrl = useRuntimeConfig().public.API_BASE_URL ?? window.location.origin
const authStore = useAuthStore();

const organization = ref({
    title: null,
    limits: {
        userLimits: null,
        cameraLimits: null,
    },
    isDefault: null,
    ownerId: authStore.id,
});

const errorMessage = ref({});
const maxRetries = 5;
let retryCount = 0;

const users = ref([]);

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
});

const validateLimit = (value) => {
    if (!value) return true;
    const parsed = parseInt(value, 10);
    return !isNaN(parsed) && parsed >= 0;
};

const isValid = computed(() =>
    organization.value.title
);

const submitForm = async () => {
    if (!isValid.value) return;

    const { data, error } = await useFetch(`${apiUrl}/api/v1.0/organizations`, {
        method: 'POST',
        credentials: 'include',
        body: organization.value,
    });

    await useFetch(`${apiUrl}/api/v1.0/organizations/${data.value.id}/folders`, {
        method: 'POST',
        credentials: 'include',
        body: {
            organizationId: data.value.id,
            title: `${organization.value.title}`,
        },
    });

    if (!error.value) {
        navigateTo(`/organization/${data.value.id}`);
    } else {
        console.error('Ошибка при создании организации:', error.value);
        errorMessage.value = 'Ошибка создания организации';
    }
};

const cancel = () => navigateTo('/organizations');
</script>

<template>
    <v-container class="d-flex justify-center align-center">
        <v-sheet class="pa-4" width="800" style="max-height: 90vh; overflow: auto;">
            <v-form @submit.prevent="submitForm">
                <v-row>
                    <v-col cols="12">
                        <v-text-field v-model="organization.title" label="Название организации"
                            :rules="[v => !!v || 'Обязательное поле']" required density="compact"
                            outlined></v-text-field>
                        <v-select v-model="organization.ownerId" :items="users" item-title="login" item-value="id"
                            label="Владелец" :rules="[v => !!v || 'Обязательное поле']" required density="compact"
                            outlined></v-select>
                        <v-text-field v-model="organization.limits.cameraLimit" label="Лимит камер"
                            :rules="[v => validateLimit(v) || 'Должно быть положительное число']" density="compact"
                            outlined placeholder="неограничено"></v-text-field>
                        <v-text-field v-model="organization.limits.userLimit" label="Лимит пользователей"
                            :rules="[v => validateLimit(v) || 'Должно быть положительное число']" density="compact"
                            outlined placeholder="неограничено"></v-text-field>
                    </v-col>
                </v-row>
                <v-btn type="submit" :disabled="!isValid" color="primary">Создать организацию</v-btn>
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
