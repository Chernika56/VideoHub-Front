export default defineEventHandler(async (event) => {
    try {
        const query = getQuery(event);

        const nitroApp = useNitroApp()

        return await nitroApp.fluApi.getAll('streamers', query);
    } catch (error) {
        console.error('Ошибка получения стримеров:', error);
        throw createError({ statusCode: 500, message: error });
    }
});
