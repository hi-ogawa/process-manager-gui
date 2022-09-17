import { contextBridge, ipcRenderer } from "electron";

// TODO: typing
function main() {
  contextBridge.exposeInMainWorld("preloadApi", {
    ping: () => {
      return ipcRenderer.invoke("ping");
    },
  });
}

main();
