<script setup>
const props = defineProps({
    folder: Object,
    level: Number,
    tableColumns: Object,
    streamers: Object,
});

const emit = defineEmits(['refresh']);

const apiUrl = useRuntimeConfig().public.API_BASE_URL ?? window.location.origin

const isOpen = ref(props.folder.isOpen);

const regex = /@([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)/;

const getStatusClass = (status) => (status ? 'status-green' : 'status-red');

const toggleFolder = () => {
    isOpen.value = !isOpen.value;
    props.folder.isOpen = isOpen.value;
};

const showModal = ref(false)
const newFolderName = ref('')
const targetFolderId = ref(null)

const addSubFolder = (parentId) => {
    targetFolderId.value = parentId
    newFolderName.value = ''
    showModal.value = true
}

const deleteFolder = async (parentId) => {
    const { data, error, status } = await useFetch(`${apiUrl}/api/v1.0/organizations/${props.folder.organizationId}/folders/${parentId}`, {
        method: "DELETE",
        credentials: 'include',
    })

    emit('refresh');
}

const confirmAddFolder = async () => {
    if (newFolderName.value.trim()) {
        const { data, error, status } = await useFetch(`${apiUrl}/api/v1.0/organizations/${props.folder.organizationId}/folders`, {
            method: "POST",
            body: {
                organizationId: props.folder.organizationId,
                parentId: targetFolderId.value,
                title: newFolderName.value.trim(),
                hierarchy: {
                    level: props.level + 1,
                }
            },
            credentials: 'include',
        })

        showModal.value = false
        emit('refresh');
    }
}

const cancel = () => {
    showModal.value = false
}
</script>

<template>
    <tr class="folder-row">
        <td :colspan="Object.keys(tableColumns).length" :style="{ paddingLeft: `${level * 20}px` }">
            <button @click="toggleFolder" class="arrow">
                {{ isOpen ? '▼' : '▶' }}
            </button>
            📂 {{ folder.title }}
            <!-- <template v-if="level == 0">
                📂 {{ folder.organizationName }}
            </template>
            <template v-else>
                📂 {{ folder.title }}
            </template> -->
            <button class="icon-button" @click="addSubFolder(folder.id)" title="Добавить вложенную папку">➕</button>
            <button v-if="level != 0" class="icon-button" @click="deleteFolder(folder.id)" title="Удалить папку">🗑️</button>
        </td>
    </tr>

    <template v-if="isOpen">
        <tr v-for="video in folder.cameras" :key="video.name">
            <template v-for="(column, key) in tableColumns" :key="key">

                <td v-if="column.visible && key === 'name'" :class="key"
                    :style="{ paddingLeft: `${(level + 1) * 20}px` }">
                    <span :class="['status-dot', getStatusClass(video.enabled)]"></span>
                    <!-- <span :class="['status-dot', getStatusClass(video.streamStatus.alive)]"></span> -->
                    <nuxt-link :to="`/camera/${video.name}`">
                        {{ video.title }}
                    </nuxt-link>
                </td>

                <td v-else-if="column.visible && key === 'streamUrl'" :class="key" :title="video.streamUrl">
                    {{ video.streamUrl }}
                </td>

                <td v-else-if="column.visible && key === 'subStreamUrl'" :class="key" :title="video.subStreamUrl">
                    {{ video.subStreamUrl }}
                </td>

                <td v-else-if="column.visible && key === 'preset'" :class="key">
                    {{ video.preset.title }}
                </td>

                <td v-else-if="column.visible && key === 'dvrDepth'" :class="key">
                    {{ video.dvrDepth == 1 ? "1 day" : video.dvrDepth ? `${video.dvrDepth} days` : '' }}
                </td>

                <td v-else-if="column.visible && key === 'ipAddress'" :class="key">
                    {{ video.streamUrl.match(regex)?.[1] }}
                </td>

                <td v-else-if="column.visible && key === 'dvrLimit'" :class="key">

                </td>

                <td v-else-if="column.visible && key === 'streamer'" :class="key">
                    {{ streamers[0].hostName }}

                </td>

                <td v-else-if="column.visible && key === 'dvrSpace'" :class="key">
                    {{ video.dvrSpace }}
                </td>
            </template>
        </tr>

        <template v-for="child in folder.children" :key="child.id">
            <FolderRow :folder="child" :level="level + 1" :tableColumns="tableColumns" @refresh="emit('refresh')"/>
        </template>
    </template>

    <teleport to="body">
        <div v-if="showModal" class="modal-overlay">
            <div class="modal-content">
                <h3>Введите название вложенной папки</h3>
                <input v-model="newFolderName" placeholder="Название папки" />
                <div class="modal-buttons">
                    <button @click="confirmAddFolder">Создать</button>
                    <button @click="cancel">Отмена</button>
                </div>
            </div>
        </div>
    </teleport>
</template>

<style>
.folder-row td {
    background: #d9eafc;
    font-weight: bold;
}

.arrow {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 10px;
    width: 5px;
}

.icon-button :hover {
    background-color: #ddd;
}

.icon-button {
    margin-left: 8px;
    padding: 2px 6px;
    background: transparent;
    border: none;
    cursor: pointer;
    font-size: 12px;
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
}

.modal-content {
    background: white;
    padding: 20px;
    border-radius: 10px;
    min-width: 300px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.modal-buttons {
    margin-top: 10px;
    display: flex;
    gap: 10px;
    justify-content: flex-end;
}

.modal-content input {
    width: 100%;
    padding: 6px;
    margin-top: 10px;
    box-sizing: border-box;
}
</style>