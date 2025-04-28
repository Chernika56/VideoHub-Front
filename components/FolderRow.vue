<script setup>
const props = defineProps({
    folder: Object,
    level: Number,
    tableColumns: Object,
    streamers: Object,
});

const isOpen = ref(props.folder.isOpen);

const regex = /@([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)/;

const getStatusClass = (status) => (status ? 'status-green' : 'status-red');

const toggleFolder = () => {
    isOpen.value = !isOpen.value;
    props.folder.isOpen = isOpen.value;
};
</script>

<template>
    <tr class="folder-row">
        <td :colspan="Object.keys(tableColumns).length" :style="{ paddingLeft: `${level * 20}px` }">
            <button @click="toggleFolder" class="arrow">
                {{ isOpen ? '▼' : '▶' }}
            </button>
            <template v-if="level == 0">
                📂 {{ folder.organizationName }}
            </template>
            <template v-else>
                📂 {{ folder.title }}
            </template>
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

                <td v-else-if="column.visible && key === 'subStreamUrl'" :class="key"
                    :title="video.subStreamUrl">
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
            <FolderRow :folder="child" :level="level + 1" :tableColumns="tableColumns" />
        </template>
    </template>
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
</style>