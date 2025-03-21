export default defineEventHandler(async (event) => {
    try {
        const query = getQuery(event); 

        const nitroApp = useNitroApp()

        return await nitroApp.fluApi.getAll('messages', query);
    } catch (error) {
        console.error('Ошибка получения сообщений:', error);
        throw createError({ statusCode: 500, message: error });
    }
});
