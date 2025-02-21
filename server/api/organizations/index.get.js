export default defineEventHandler(async (event) => {
    try {
        const query = getQuery(event); // Получаем параметры запроса

        const nitroApp = useNitroApp()

        return await nitroApp.fluApi.getAll('organizations', query);
    } catch (error) {
        console.error('Ошибка получения организаций:', error);
        throw createError({ statusCode: 500, message: error });
    }
});
