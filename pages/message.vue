<script setup>
const apiUrl = useRuntimeConfig().public.API_BASE_URL ?? window.location.origin

definePageMeta({
    title: 'Сообщения',
})

const receivedMessages = ref([])
const sentMessages = ref([])
const loading = ref(true)
const error = ref(null)
const activeTab = ref('received')
const currentUser = ref("Admin")

// const fetchCurrentUser = async () => {
//     const { data, error } = await useFetch(`${apiUrl}/api/v1.0/profile/info`, {
//         credentials: 'include'
//     })
//     if (data.value) {
//         currentUser.value = data.value
//     } else {
//         console.error(error)
//         error.value = 'Не удалось загрузить пользователя'
//     }
// }

const fetchMessages = async () => {
    loading.value = true
    try {
        const [received, sent] = await Promise.all([
            useFetch(`${apiUrl}/api/v1.0/profile/messages/received`, {
                method: 'GET',
                credentials: 'include'
            }),
            useFetch(`${apiUrl}/api/v1.0/profile/messages/sent`, {
                method: 'GET',
                credentials: 'include'
            }),
        ])

        if (received.data.value) {
            receivedMessages.value = received.data.value.filter(m => !m.isDeleted && m.isDashboard)
        }

        if (sent.data.value) {
            sentMessages.value = sent.data.value.filter(m => !m.isDeleted && m.isDashboard)
        }

    } catch (err) {
        console.error(err)
        error.value = 'Ошибка загрузки сообщений'
    } finally {
        loading.value = false
    }
}

onMounted(async () => {
    // await fetchCurrentUser()
    await fetchMessages()
})

const toggleRead = async (msg) => {
    if (msg.wasRead) return

    msg.wasRead = true
    await useFetch(`${apiUrl}/api/v1.0/messages/${msg.id}/`, {
        method: 'PUT',
        body: {
            wasRead: true
        },
        credentials: 'include'
    })
}

const showMessageModal = ref(false);
const messageForm = ref({
    title: '',
    body: '',
    type: 'info',
    isPush: true,
    isDashboard: true
});

const openMessageModal = (msg) => {
    messageForm.value = {
        id: msg.id,
        title: msg.title,
        body: msg.body,
        type: msg.type,
        isPush: msg.isPush,
        isDashboard: msg.isDashboard
    };
    showMessageModal.value = true;
};

const closeMessageModal = () => {
    showMessageModal.value = false;
};

const saveMessage = async () => {
    try {
        const { error } = await useFetch(`${apiUrl}/api/v1.0/messages/${messageForm.value.id}`, {
            method: 'PUT',
            body: messageForm.value,
            credentials: 'include'
        });

        if (!error.value) {
            // alert('Сообщение отправлено');
            closeMessageModal();
        } else {
            alert('Ошибка при изменении сообщения');
        }
        fetchMessages()
    } catch (err) {
        console.error('Ошибка изменения:', err);
        alert('Ошибка при изменении сообщения');
    }
};

const deleteMessage = async () => {
    try {
        const { error } = await useFetch(`${apiUrl}/api/v1.0/messages/${messageForm.value.id}`, {
            method: 'PUT',
            body: {
                isDeleted: true
            },
            credentials: 'include'
        });

        if (!error.value) {
            // alert('Сообщение отправлено');
            closeMessageModal();
        } else {
            alert('Ошибка при удалении сообщения');
        }
        fetchMessages()
    } catch (err) {
        console.error('Ошибка удаления:', err);
        alert('Ошибка при удалении сообщения');
    }
};
</script>


<template>
    <div class="messages-page">
        <div class="tabs">
            <button :class="{ active: activeTab === 'received' }" @click="activeTab = 'received'">Входящие</button>
            <button :class="{ active: activeTab === 'sent' }" @click="activeTab = 'sent'">Отправленные</button>
        </div>

        <div v-if="loading">Загрузка...</div>
        <div v-else-if="error">{{ error }}</div>

        <div v-else>
            <div v-if="activeTab === 'received'">
                <div v-if="receivedMessages.length === 0">Нет входящих сообщений</div>
                <div v-else class="messages-list">
                    <div v-for="msg in receivedMessages" :key="msg.id" class="message-card"
                        :class="{ unread: !msg.wasRead }" @click="toggleRead(msg)">
                        <div class="message-header">
                            <strong>{{ msg.title || '(без заголовка)' }}</strong>
                            <span class="message-type">{{ msg.type }}</span>
                            <span class="message-sender">{{ msg.senderLogin }}</span>
                        </div>
                        <div class="message-body">
                            {{ msg.body?.slice(0, 150) }}<span v-if="msg.body?.length > 150">...</span>
                        </div>
                    </div>
                </div>
            </div>

            <div v-else-if="activeTab === 'sent'">
                <div v-if="sentMessages.length === 0">Нет отправленных сообщений</div>
                <div v-else class="messages-list">
                    <div v-for="msg in sentMessages" :key="msg.id" class="message-card" @click="openMessageModal(msg)">
                        <div class="message-header">
                            <strong>{{ msg.title || '(без заголовка)' }}</strong>
                            <span class="message-type">{{ msg.type }}</span>
                            <span class="message-sender">{{ msg.userLogin }}</span>
                        </div>
                        <div class="message-body">
                            {{ msg.body?.slice(0, 150) }}<span v-if="msg.body?.length > 150">...</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div v-if="showMessageModal" class="modal-overlay">
        <div class="modal-content">
            <h3>Изменение сообщения</h3>
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
                <button class="button" @click="saveMessage">Сохранить</button>
                <button class="button delete" @click="deleteMessage">Удалить</button>
                <button class="button" @click="closeMessageModal">Отмена</button>
            </div>
        </div>
    </div>
</template>


<style scoped>
.messages-page {
    max-width: 100%;
    margin: 0 auto;
    padding: 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.messages-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 20px;
}

.message-card {
    border: 1px solid #ccc;
    border-radius: 6px;
    padding: 12px;
    cursor: pointer;
    background-color: #f8f8f8;
    transition: 0.2s;
}

.message-card:hover {
    background-color: #f0f0f0;
}

.message-card.unread {
    border-color: #007bff;
    background-color: #e6f0ff;
}

.message-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;
    margin-bottom: 6px;
}

.message-body {
    font-size: 15px;
}

.message-type {
    font-style: italic;
    opacity: 0.6;
}

.message-sender {
    font-size: 13px;
    opacity: 0.7;
}

.tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
}

.tabs button {
    padding: 8px 16px;
    border: none;
    background: #eee;
    cursor: pointer;
    border-radius: 4px;
    font-weight: bold;
}

.tabs button.active {
    background: #007bff;
    color: white;
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

.delete {
    background: red
}
</style>
