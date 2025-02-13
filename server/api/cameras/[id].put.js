export default defineEventHandler(async (event) => {
    try {
        const nitroApp = useNitroApp()

        const body = await readBody(event);

        console.log(body)

        // return await nitroApp.fluApi.updateStreamById(event.context.params.id, body);
    } catch (error) {
        console.error('Ошибка обновления камеры:', error);
        throw createError({ statusCode: 500, message: error });
    }
});
