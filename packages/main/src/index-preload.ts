import {
  COMLINK_API_NAME,
  IPC_EVENT_ENDPOINTS,
  IPC_SERVICE_ENDPOINTS,
  PRELOAD_API_NAME,
  PreloadApi,
} from "@-/common";
import { fromEntries } from "@-/common";
import { tinyassert } from "@hiogawa/utils";
import * as comlink from "comlink";
import { IpcRendererEvent, contextBridge, ipcRenderer } from "electron";
import type { MainApp } from "./main-app";

export const COMLINK_CHANNEL = "__comlink_channel";

type ListenerWrapper = (event: IpcRendererEvent, ...args: any[]) => void;

export function createPreloadEndpoint(
  ipcRenderer: Electron.IpcRenderer
): comlink.Endpoint {
  const listerWrappers = new WeakMap<object, ListenerWrapper>();

  return {
    postMessage: (message: any, transfer?: Transferable[]) => {
      const ports: MessagePort[] = [];
      for (const t of transfer ?? []) {
        tinyassert(t instanceof MessagePort);
        ports.push(t);
      }
      ipcRenderer.postMessage(COMLINK_CHANNEL, message, ports);
    },

    addEventListener: (
      type: string,
      listener: EventListenerOrEventListenerObject,
      _options?: {}
    ) => {
      const wrapper: ListenerWrapper = (event, ...args) => {
        event.senderId; // TODO: identify associated renderer window
        const comlinkEvent = { data: args[0] } as MessageEvent;
        if ("handleEvent" in listener) {
          listener.handleEvent(comlinkEvent);
        } else {
          listener(comlinkEvent);
        }
      };
      ipcRenderer.on(type, wrapper);
      listerWrappers.set(listener, wrapper);
    },

    removeEventListener: (
      type: string,
      listener: EventListenerOrEventListenerObject,
      _options?: {}
    ) => {
      const wrapper = listerWrappers.get(listener);
      if (wrapper) {
        ipcRenderer.off(type, wrapper);
        listerWrappers.delete(listener);
      }
    },
  };
}

function main() {
  contextBridge.exposeInMainWorld(PRELOAD_API_NAME, preloadApiProxy);

  const proxy = comlink.wrap<MainApp>(createPreloadEndpoint(ipcRenderer));
  contextBridge.exposeInMainWorld(COMLINK_API_NAME, proxy);
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
