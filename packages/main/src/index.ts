import fs from "fs";
import path from "path";
import { Config, IPC_SERVICE_ENDPOINTS, IpcServiceApi } from "@-/common";
import { BrowserWindow, Menu, app, ipcMain } from "electron";

// TODO: open config file directly in editor from menu?
const CONFIG_PATH = path.resolve(app.getPath("userData"), "config.json");

const PRELOAD_JS_PATH = path.resolve(__dirname, "index-preload.cjs");

const RENDERER_URL =
  process.env["APP_RENDERER_URL"] ??
  new URL(`file://${__dirname}/../../renderer/build/index.html`).toString();

async function main() {
  await app.whenReady();
  await ensureConfig();
  setupIpc();
  await createWindow();
}

function setupIpc() {
  const serviceApi = new IpcServiceApiImpl();
  for (const endpoint of IPC_SERVICE_ENDPOINTS) {
    ipcMain.handle(endpoint, (_event, ...args: any[]) =>
      (serviceApi[endpoint] as any)(...args)
    );
  }
}

class IpcServiceApiImpl implements IpcServiceApi {
  ["/config/get"] = async () => {
    const config = await fs.promises.readFile(CONFIG_PATH, "utf-8");
    return JSON.parse(config);
  };

  ["/config/update"] = async (config: Config) => {
    await fs.promises.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2));
  };

  ["/process/start"] = async () => 0 as any;

  ["/process/stop"] = async () => 0 as any;

  ["/status/get"] = async () => 0 as any;
}

async function ensureConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    await fs.promises.writeFile(CONFIG_PATH, "{}");
  }
}

async function createWindow() {
  const window = new BrowserWindow({
    webPreferences: {
      preload: PRELOAD_JS_PATH,
    },
  });
  window.webContents.once("dom-ready", () => {
    createContextMenu(window);
  });
  await window.loadURL(RENDERER_URL);
}

function createContextMenu(window: BrowserWindow) {
  window.webContents.on("context-menu", (_event, props) => {
    const menu = Menu.buildFromTemplate([
      // https://github.com/electron/fiddle/blob/19360ade76354240630e5660469b082128e1e57e/src/main/context-menu.ts#L113
      {
        id: "inspect",
        label: "Inspect",
        click: () => {
          window.webContents.inspectElement(props.x, props.y);
          if (!window.webContents.isDevToolsOpened()) {
            window.webContents.devToolsWebContents?.focus();
          }
        },
      },
    ]);
    menu.popup({});
  });
}

if (require.main === module) {
  main();
}
