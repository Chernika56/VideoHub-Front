export default defineEventHandler(async (event) => {
    try {

        const options = {
            limit: 255, // 255
            select: null,
            sort: '-name', // '-name'
            cursor: null,
            q: null,
        }

        const nitroApp = useNitroApp()

        return await nitroApp.fluApi.getStreams(options);
    } catch (error) {
        console.error('Ошибка получения камер:', error);
        throw createError({ statusCode: 500, message: error });
    }
});
