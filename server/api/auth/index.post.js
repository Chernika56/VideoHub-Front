export default defineEventHandler(async (event) => {
  const { login, password } = await readBody(event);

  const nitroApp = useNitroApp()

  return await nitroApp.fluApi.logIn(login, password);
});
