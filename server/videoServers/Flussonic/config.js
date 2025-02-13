import * as path from "node:path";
import * as fs from "node:fs/promises";

const filePath = "D:\\Diplom\\FrontEnd-Nuxt\\config.json"

export default async function getConfig() {
  try {
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  } catch (ex) {
    console.log("getConfig:", ex);
    const config = {
      videoServer: {
        host: "https://camdvr1.1net.by",
        port: "1337",
        username: "admin",
        password: "321678qw",
      },
      login: { password: "admin" },
    };
    await writeConfig(config);

    return config;
  }
}

async function writeConfig(value) {
  try {
    await fs.writeFile(filePath, JSON.stringify(value));

    return true;
  } catch {
    return false;
  }
}
