<script setup>
const route = useRoute();
const router = useRouter();

const apiUrl = useRuntimeConfig().public.API_BASE_URL ?? window.location.origin

const camera = ref({
	name: null,

	comment: null,
	coordinates: null,
	dvrDepth: null,
	dvrLockDays: null,
	dvrPath: 'dvr',
	dvrSpace: null,
	folderId: null,
	motionDetectorEnabled: null,
	permissions: {
		view: true,
		edit: true,
		ptz: true,
		dvr: true,
		dvrDepthLimit: null,
		actions: true,
	},
	postalAddress: null,
	presetId: null,
	streamUrl: null,
	subStreamUrl: null,
	streamerId: null,
	title: null,
	organizationId: null,


	//eventThumbnails: null,
	enabled: true,
});

const maxRetries = 5;
let retryCount = 0;

const streamers = ref([]);
const organizations = ref([]);
const presets = ref([]);
const folders = ref([]);
const errorMessage = ref();

const fetchStreamers = async () => {
	try {
		if (retryCount < maxRetries) {
			const { data } = await useFetch(`${apiUrl}/api/v1.0/streamers`, {
				method: "GET",
				credentials: 'include',
			});


			console.log(`Попытка ${retryCount + 1} (стримеры):`, data.value);

			if (!data.value) {
				retryCount++;
				console.warn(`Попытка ${retryCount}: Данные не загрузились, пробуем еще раз через 1 сек...`);
				setTimeout(fetchStreamers, 1000);
				return;
			}

			streamers.value = data.value
			retryCount = 0
		} else {
			errorMessage.value = 'Превышено число попыток'
			console.error(errorMessage.value)
		}

	} catch (error) {
		errorMessage.value = 'Ошибка загрузки стримеров';
		console.error('Ошибка загрузки стримеров:', error);
	}
}

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

const fetchFolders = async () => {
	try {
		if (retryCount < maxRetries) {
			const { data } = await useFetch(`${apiUrl}/api/v1.0/folders`, {
				method: "GET",
				credentials: 'include',
			});

			console.log(`Попытка ${retryCount + 1} (папки):`, data.value);

			if (!data.value) {
				retryCount++;
				console.warn(`Попытка ${retryCount}: Данные не загрузились, пробуем еще раз через 1 сек...`);
				setTimeout(fetchFolders, 1000);
				return;
			}

			folders.value = data.value
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

const fetchPresets = async () => {
	try {
		if (retryCount < maxRetries) {
			const { data } = await useFetch(`${apiUrl}/api/v1.0/presets`, {
				method: "GET",
				credentials: 'include',
			});

			console.log(`Попытка ${retryCount + 1} (пресеты):`, data.value);

			if (!data.value) {
				retryCount++;
				console.warn(`Попытка ${retryCount}: Данные не загрузились, пробуем еще раз через 1 сек...`);
				setTimeout(fetchPresets, 1000);
				return;
			}

			presets.value = data.value
			retryCount = 0
		} else {
			errorMessage.value = 'Превышено число попыток'
			console.error(errorMessage.value)
		}

	} catch (error) {
		errorMessage.value = 'Ошибка загрузки пресетов';
		console.error('Ошибка загрузки пресетов:', error);
	}
}

onMounted(async () => {
	await fetchStreamers();
	await fetchOrganizations();

	if (route.query.defaultOrg && organizations.value.length > 0) {
		const defaultOrgId = Number(route.query.defaultOrg);
		const exists = organizations.value.some(org => Number(org.id) === defaultOrgId);
		if (exists) {
			camera.value.organizationId = defaultOrgId;
		}
	}

	await fetchFolders();
	await fetchPresets();
});

const dvrDepthOptions = ref([
	{ id: null, name: "DVR отключен" },
	{ id: 1, name: "1 день" },
	{ id: 2, name: "2 дня" },
	{ id: 3, name: "3 дня" },
	{ id: 7, name: "7 дней" },
]);

const dvrLockDaysOptions = ref([
	{ id: null, name: "DVR отключен" },
	{ id: 1, name: "1 день" },
	{ id: 2, name: "2 дня" },
	{ id: 3, name: "3 дня" },
	{ id: 7, name: "7 дней" },
]);

const thumbnailsOptions = ref([
	{ id: null, name: "Не использовать" },
	{ id: 1, name: "1 день" },
	{ id: 2, name: "2 дня" },
	{ id: 3, name: "3 дня" },
	{ id: 7, name: "7 дней" },
]);

const isValid = computed(() => {
	return camera.value.title && camera.value.streamUrl && camera.value.streamerId && camera.value.organizationId
		&& camera.value.folderId && camera.value.presetId;
});

const submitForm = async () => {
	if (isValid.value) {
		camera.value.name = camera.value.title + '-' + Date.now().toString(36);

		console.log('Отправка данных:', camera.value);

		const { data, error, status } = await useFetch(`${apiUrl}/api/v1.0/cameras/${camera.value.name}`, {
			method: "PUT",
			body: camera.value,
			credentials: 'include',
		})

		console.log('Получение данных:', data.value, status)

		navigateTo(`/camera/${data.value.name}`)
	} else {
		console.log('Заполните обязательные поля!');
	}
};

const cancel = () => {
	if (window.history.length > 1) {
		router.back();
	} else {
		navigateTo('/cameras'); 
	}
}

</script>

<template>
	<v-container class="d-flex justify-center align-center">
		<v-sheet class="pa-4" width="1200" style="max-height: 90vh; overflow: auto;">
			<v-form @submit.prevent="submitForm">
				<v-row>
					<v-col cols="6">
						<v-text-field v-model="camera.title" label="Название. English"
							:rules="[v => !!v || 'Обязательное поле']" required density="compact"
							outlined></v-text-field>
						<v-text-field v-model="camera.comment" label="Коментарий" density="compact"
							outlined></v-text-field>
						<v-text-field v-model="camera.streamUrl" label="URL потока"
							:rules="[v => !!v || 'Обязательное поле']" required density="compact"
							outlined></v-text-field>
						<v-text-field v-model="camera.subStreamUrl" label="URL подпотока" density="compact"
							outlined></v-text-field>
					</v-col>

					<v-col cols="6">
						<v-select v-model="camera.streamerId" :items="streamers" item-title="hostName" item-value="id"
							label="Стример" :rules="[v => !!v || 'Обязательное поле']" required density="compact"
							outlined></v-select>
						<v-select v-model="camera.organizationId" :items="organizations" item-title="title"
							item-value="id" label="Организация" :rules="[v => !!v || 'Обязательное поле']" required
							density="compact" outlined></v-select>
						<v-select v-model="camera.presetId" :items="presets" label="Пресет" item-title="title"
							item-value="id" :rules="[v => !!v || 'Обязательное поле']" required density="compact"
							outlined></v-select>
						<v-select v-model="camera.folderId" :items="folders" label="Папка" item-title="title"
							item-value="id" :rules="[v => !!v || 'Обязательное поле']" required density="compact"
							outlined></v-select>
					</v-col>

					<v-col cols="6">
						<v-select v-model="camera.dvrDepth" :items="dvrDepthOptions" item-title="name" item-value="id"
							label="Глубина DVR" density="compact" outlined></v-select>
						<v-select v-model="camera.dvrLockDays" :items="dvrLockDaysOptions" item-title="name"
							item-value="id" label="Лимит DVR" density="compact" outlined></v-select>
						<v-text-field v-model.number="camera.dvrSpace" label="Пространство DVR, ГБ" type="number"
							density="compact" outlined></v-text-field>
						<v-select :items="thumbnailsOptions" item-title="name" item-value="id"
							label="Точные миниатюры событий" density="compact" outlined></v-select>
						<!-- <v-select v-model="camera.eventThumbnails" :items="thumbnailsOptions" item-title="name"
							item-value="id" label="Точные миниатюры событий" density="compact" outlined></v-select> -->
					</v-col>

					<v-col cols="6">
						<v-switch v-model="camera.motionDetectorEnabled" label="Включить распознавание"
							density="compact" outlined
							:class="{ 'switch-active': camera.motionDetectorEnabled }"></v-switch>
						<v-switch v-model="camera.enabled" label="Включена" density="compact" outlined
							:class="{ 'switch-active': camera.enabled }"></v-switch>
						<!-- <v-checkbox v-model="camera.motionDetectorEnabled" label="Включить распознавание" density="compact"
               outlined></v-checkbox> -->
						<!-- <v-checkbox v-model="camera.enabled" label="Включена" density="compact" outlined ></v-checkbox> -->
						<v-text-field v-model="camera.coordinates" label="Координаты" density="compact"
							outlined></v-text-field>
						<v-text-field v-model="camera.postalAddress" label="Адрес" density="compact"
							outlined></v-text-field>
					</v-col>
				</v-row>

				<v-btn type="submit" :disabled="!isValid" color="primary">Создать камеру</v-btn>
				<v-btn @click="cancel" style="margin-left: 30px;">Отмена</v-btn>
			</v-form>
		</v-sheet>
	</v-container>
</template>

<style scoped>
html,
body {
	overflow: hidden;
}

.switch-active .v-selection-control__input {
	color: green !important;
}
</style>
