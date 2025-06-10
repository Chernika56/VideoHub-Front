<script setup>
const apiUrl = useRuntimeConfig().public.API_BASE_URL ?? window.location.origin

definePageMeta({
    title: 'Профиль',
})

const profile = ref({
    login: '',
    name: '',
    email: '',
    phone: '',
    note: '',
    maxSession: 0
})

const loading = ref(true)
const saving = ref(false)
const errorMessage = ref({});
const maxRetries = 3;
let retryCount = 0;

const fetchProfile = async () => {
    loading.value = true
    try {
        if (retryCount < maxRetries) {
            const { data } = await useFetch(`${apiUrl}/api/v1.0/profile`, {
                method: 'GET',
                credentials: 'include'
            })

            // console.log(`Попытка ${retryCount + 1} (профиль):`, data.value);

            if (!data.value) {
                retryCount++;
                console.warn(`Попытка ${retryCount}: Данные не загрузились, пробуем еще раз через 1 сек...`);
                setTimeout(fetchProfile, 1000);
                return;
            }

            profile.value = data.value
            retryCount = 0
        } else {
            errorMessage.value = 'Превышено число попыток'
            console.error(errorMessage.value)
        }
    } catch (error) {
        errorMessage.value = 'Ошибка загрузки профиля';
        console.error('Ошибка загрузки профиля:', error);
    } finally {
        loading.value = false
    }
}

const saveProfile = async () => {
    saving.value = true
    try {
        const { data, error } = await useFetch(`${apiUrl}/api/v1.0/profile`, {
            method: 'PUT',
            body: {
                name: profile.value.name,
                email: profile.value.email,
                phone: profile.value.phone,
                note: profile.value.note
            },
            credentials: 'include',
        })
    } catch (error) {
        console.error(error)
    } finally {
        saving.value = false
    }
}

onMounted(fetchProfile)
</script>

<template>
    <div class="profile-container">
        <div v-if="loading">Загрузка...</div>
        <div v-else>
            <div class="field"><strong>Логин:</strong> {{ profile.login }}</div>
            <div class="field"><strong>Макс. сессий:</strong> {{ profile.maxSession }}</div>

            <div class="form-group">
                <label>Имя</label>
                <input v-model="profile.name" type="text" class="input" />
            </div>

            <div class="form-group">
                <label>Email</label>
                <input v-model="profile.email" type="email" class="input" />
            </div>

            <div class="form-group">
                <label>Телефон</label>
                <input v-model="profile.phone" type="tel" class="input" />
            </div>

            <div class="form-group">
                <label>Заметка</label>
                <textarea v-model="profile.note" class="textarea" rows="3" />
            </div>

            <button class="button" @click="saveProfile" :disabled="saving">
                💾 Сохранить
            </button>
        </div>
    </div>
</template>

<style scoped>
.profile-container {
    max-width: 100%;
    margin: 0 auto;
    padding: 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.field {
    margin-bottom: 10px;
}

.form-group {
    margin-bottom: 15px;
}

.input,
.textarea {
    width: 100%;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 5px;
}

.button {
    padding: 10px 16px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
}

.button:disabled {
    background: #aaa;
    cursor: not-allowed;
}

.message {
    margin-top: 15px;
    color: green;
}
</style>