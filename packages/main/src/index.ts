import path from "path";
import { BrowserWindow, app, ipcMain } from "electron";

async function main() {
  await app.whenReady();
  const window = new BrowserWindow({
    webPreferences: {
      preload: path.resolve(__dirname, "index-preload.cjs"),
    },
  });
  ipcMain.handle("ping", () => "pong");
  const url =
    process.env["APP_RENDERER_URL"] ??
    new URL(`file://${__dirname}/../../renderer/build/index.html`).toString();
  await window.loadURL(url);
}

if (require.main === module) {
  main();
}
