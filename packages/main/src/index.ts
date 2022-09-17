import path from "path";
import { BrowserWindow, app, ipcMain } from "electron";

async function main() {
  await app.whenReady();
  const window = new BrowserWindow({
    webPreferences: {
      preload: path.resolve(process.env["APP_PRELOAD_SCRIPT"]!),
    },
  });
  ipcMain.handle("ping", () => "pong");
  await window.loadURL(process.env["APP_RENDERER_URL"]!);
}

if (require.main === module) {
  main();
}
