import axios from 'axios';

const axiosApi = axios.create({
    baseURL: 'https://localhost:7277/api/v1.0', // Адрес вашего сервера
    withCredentials: true, // Включаем отправку куков
});

export default axiosApi;
