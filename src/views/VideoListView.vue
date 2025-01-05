<script setup>
import { ref, onMounted } from 'vue';
import axiosApi from '@/services/axiosApi.js';
import { authState } from '@/stores/auth.js';
import { useRouter } from 'vue-router';


const router = useRouter();

const videos = ref([]); // Список видео
const errorMessage = ref(''); // Сообщение об ошибке

// Функция для загрузки списка видео
const fetchVideos = async () => {
    try {
        const response = await axiosApi.get('/video/list'); // Замените на ваш API для получения списка видео
        console.log(response)
        if (response.status === 200) {
            videos.value = response.data; // Предполагается, что ответ — массив объектов { name: string, path: string }
        }
    } catch (error) {
        if (error.response.status === 401) {
            alert('Неавторизован. Выход из аккаунта.');
            authState.logout();
            router.push('/auth');
        }

        errorMessage.value = 'Ошибка загрузки списка видео';
        console.error('Ошибка загрузки видео:', error);
    }
};

onMounted(() => {
    fetchVideos();
});
</script>

<template>
    <div class="video-list-page">
        <h1>Список видео</h1>
        <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
        <ul v-else>
            <li v-for="video in videos" :key="video.path">
                <router-link :to="{ name: 'VideoPlayer', params: { videoName: video.videoName, videoPath: video.videoPath } }">
                    {{ video.videoName }}
                </router-link>
            </li>
        </ul>
    </div>
</template>

<style scoped>
.video-list-page {
    left: 170px;
    position: fixed;
    top: 42px;
    bottom: 0;
    right: 0;
    overflow: auto;
    overflow-x: hidden;
    padding: 20px;
    position: relative;
    min-height: 100%;
    background-color: var(--backgroundColorMain, #f3f5f7);
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
