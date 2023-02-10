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
import { COMLINK_CHANNEL } from "./common";
import type { MainApp } from "./main-app";

function createPreloadEndpoint(
  ipcRenderer: Electron.IpcRenderer
): comlink.Endpoint {
  // TODO: can we ditch electron specific ipc in favor of MessageChannel?
  const { port1, port2 } = new MessageChannel();
  port1;
  port2;

  const listerWrappers = new WeakMap<object, any>();

  return {
    postMessage: (message: any, transfer?: Transferable[]) => {
      // comlink uses `MessageChannel` to proxy callback
      // https://github.com/GoogleChromeLabs/comlink/blob/dffe9050f63b1b39f30213adeb1dd4b9ed7d2594/src/comlink.ts#L209
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
      tinyassert(type === "message");
      const wrapper = (event: IpcRendererEvent, ...args: any[]) => {
        event.senderId; // TODO: identify associated renderer window
        const comlinkEvent = { data: args[0] } as MessageEvent;
        if ("handleEvent" in listener) {
          listener.handleEvent(comlinkEvent);
        } else {
          listener(comlinkEvent);
        }
      };
      ipcRenderer.on(COMLINK_CHANNEL, wrapper);
      listerWrappers.set(listener, wrapper);
    },

    removeEventListener: (
      type: string,
      listener: EventListenerOrEventListenerObject,
      _options?: {}
    ) => {
      tinyassert(type === "message");
      const wrapper = listerWrappers.get(listener);
      if (wrapper) {
        ipcRenderer.off(COMLINK_CHANNEL, wrapper);
        listerWrappers.delete(listener);
      }
    },
  };
}

function main() {
  contextBridge.exposeInMainWorld(PRELOAD_API_NAME, preloadApiProxy);

  // exposeInMainWorld itself might be implemented via Proxy,
  // so things might be very flaky
  //
  // can we pass `new MessageChannel()` from renderer to main
  // then forget about electron IPC?
  const proxy = comlink.wrap<MainApp>(createPreloadEndpoint(ipcRenderer));
  contextBridge.exposeInMainWorld(COMLINK_API_NAME, { proxy });

  contextBridge.exposeInMainWorld("PRELOAD_API_V2", { sendMessagePort });

  ipcRenderer.on("MESSAGE_CHANNEL_HANDSHAKE", (e) => {
    console.log(e, e.ports);
    const port = e.ports[0];
    tinyassert(port);
    port.postMessage("hello from preload");
    port.start();
    // TODO: need to expose each method manually
    const portApi = {
      postMessage: port.postMessage.bind(port),
    };
    contextBridge.exposeInMainWorld("MESSAGE_PORT", portApi);
  });
}

function sendMessagePort(port: MessagePort) {
  console.log("sendMessagePort", port);
  ipcRenderer.postMessage(
    "MESSAGE_CHANNEL_HANDSHAKE",
    { type: "init", data: { port } },
    [port]
  );
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
