import path from "path";
import { BrowserWindow, app, ipcMain } from "electron";

const PRELOAD_SCRIPT = path.resolve(__dirname, "index-preload.cjs");

const RENDERER_URL =
  process.env["APP_RENDERER_URL"] ??
  new URL(`file://${__dirname}/../../renderer/build/index.html`).toString();

async function main() {
  await app.whenReady();
  setupIpc();
  const window = new BrowserWindow({
    webPreferences: {
      preload: PRELOAD_SCRIPT,
    },
  });
  await window.loadURL(RENDERER_URL);
}

function setupIpc() {
  ipcMain.handle("ping", () => "pong");
}

if (require.main === module) {
  main();
}
