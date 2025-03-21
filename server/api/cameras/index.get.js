export default defineEventHandler(async (event) => {
    try {
        const query = getQuery(event);
        console.log(query)

        const nitroApp = useNitroApp()

        return await nitroApp.fluApi.getAll('cameras', query);
    } catch (error) {
        console.error('Ошибка получения камер:', error);
        throw createError({ statusCode: 500, message: error });
    }
});
