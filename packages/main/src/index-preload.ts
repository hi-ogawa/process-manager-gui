import { IPC_SERVICE_ENDPOINTS, PRELOAD_API_NAME, PreloadApi } from "@-/common";
import { fromEntries } from "@-/common/lib/misc";
import { contextBridge, ipcRenderer } from "electron";

function main() {
  contextBridge.exposeInMainWorld(PRELOAD_API_NAME, preloadApiProxy);
}

const preloadApiProxy: PreloadApi = {
  service: fromEntries(
    IPC_SERVICE_ENDPOINTS.map((endpoint) => [
      endpoint,
      (...args: any[]) => ipcRenderer.invoke(endpoint, ...args),
    ])
  ),
  // TODO
  event: {} as any,
};

main();
