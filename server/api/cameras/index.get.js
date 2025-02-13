export default defineEventHandler(async (event) => {
    try {
        const query = getQuery(event); // Получаем параметры запроса

        console.log(query)

        const nitroApp = useNitroApp()

        return await nitroApp.fluApi.getStreams(query);
    } catch (error) {
        console.error('Ошибка получения камер:', error);
        throw createError({ statusCode: 500, message: error });
    }
});
