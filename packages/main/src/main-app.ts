import fs from "fs";
import {
  IPC_SERVICE_ENDPOINTS,
  IpcEventSend,
  IpcServiceServerApi,
} from "@-/common";
import { BrowserWindow, ipcMain } from "electron";
import { createApplicationMenu } from "./application-menu";
import { addContextMenuHandler } from "./context-menu";
import { CONFIG_PATH, PRELOAD_JS_PATH, RENDERER_URL } from "./types";

export class MainApp {
  public window?: BrowserWindow;

  async initialize() {
    await ensureConfig();
    this.initializeIpc();
    createApplicationMenu();
  }

  async start() {
    this.window = await createWindow();
  }

  initializeIpc() {
    const handlers: IpcServiceServerApi = {
      "/config/get": async () => {
        const config = await fs.promises.readFile(CONFIG_PATH, "utf-8");
        return JSON.parse(config);
      },

      "/config/update": async (_event, config) => {
        await fs.promises.writeFile(
          CONFIG_PATH,
          JSON.stringify(config, null, 2)
        );
      },

      "/process/start": async () => 0 as any,

      "/process/stop": async () => 0 as any,

      "/status/get": async () => 0 as any,
    };
    for (const endpoint of IPC_SERVICE_ENDPOINTS) {
      ipcMain.handle(endpoint, handlers[endpoint]);
    }
  }

  sendEvent: IpcEventSend = (type, ...args) => {
    this.window?.webContents.send(type, ...args);
  };
}

async function ensureConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    await fs.promises.writeFile(CONFIG_PATH, "{}");
  }
}

async function createWindow(): Promise<BrowserWindow> {
  const window = new BrowserWindow({
    webPreferences: {
      preload: PRELOAD_JS_PATH,
    },
  });
  window.webContents.once("dom-ready", () => {
    addContextMenuHandler(window);
  });
  await window.loadURL(RENDERER_URL);
  return window;
}
