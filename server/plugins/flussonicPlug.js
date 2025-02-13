import getConfig from "../videoServers/Flussonic/config"
import Flussonic from "../videoServers/Flussonic/flussonic"

export default defineNitroPlugin(async (nitroApp) => {
    const config = (await getConfig()).videoServer

    const fluApi = new Flussonic(config)
    nitroApp.fluApi = fluApi
})