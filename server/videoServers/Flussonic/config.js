import { resolve } from 'path';
import * as fs from "node:fs/promises";

const filePath = resolve(process.cwd(), 'config.json');

export default async function getConfig() {
  try {
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  } catch (ex) {
    console.log("getConfig:", ex);
    const config = {
      videoServer1netby: {
        host: "https://camdvr1.1net.by",
        path: "/vsaas/api/v2/",
        port: "1337",
        username: "admin",
        password: "321678qw",
      },
      videoServerTest: {
        host: "172.16.0.48",
        path: "/streamer/api/v3/",
        port: "80",
        username: "fluss",
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
