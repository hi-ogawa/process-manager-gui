import {
  IPC_EVENT_ENDPOINTS,
  IPC_SERVICE_ENDPOINTS,
  PRELOAD_API_NAME,
  PreloadApi,
} from "@-/common";
import { fromEntries } from "@-/common/lib/misc";
import { contextBridge, ipcRenderer } from "electron";

function main() {
  contextBridge.exposeInMainWorld(PRELOAD_API_NAME, preloadApiProxy);
}

const preloadApiProxy: PreloadApi = {
  service: fromEntries(
    IPC_SERVICE_ENDPOINTS.map((endpoint) => [
      endpoint,
      // @ts-expect-error implicit any
      (...args) => ipcRenderer.invoke(endpoint, ...args),
    ])
  ),
  event: fromEntries(
    IPC_EVENT_ENDPOINTS.map((type) => [
      type,
      {
        // @ts-expect-error implicit any
        on: (handler) => ipcRenderer.on(type, handler),
        // @ts-expect-error implicit any
        off: (handler) => ipcRenderer.off(type, handler),
      },
    ])
  ),
};

main();
