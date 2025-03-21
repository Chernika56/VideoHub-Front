export default defineEventHandler(async (event) => {
    try {
        const query = getQuery(event); 

        const nitroApp = useNitroApp()

        return await nitroApp.fluApi.getAll('folders', query);
    } catch (error) {
        console.error('Ошибка получения папок:', error);
        throw createError({ statusCode: 500, message: error });
    }
});
