export default defineEventHandler(async (event) => {
    try {
        const nitroApp = useNitroApp()

        return await nitroApp.fluApi.getStreamById(event.context.params.id);
    } catch (error) {
        console.error('Ошибка получения камеры:', error);
        throw createError({ statusCode: 500, message: error });
    }
});
