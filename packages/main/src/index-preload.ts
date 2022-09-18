import { contextBridge, ipcRenderer } from "electron";

function main() {
  contextBridge.exposeInMainWorld("PRELOAD_API", {
    "/config/get": (...args: any[]) =>
      ipcRenderer.invoke("/config/get", ...args),
    "/config/update": (...args: any[]) =>
      ipcRenderer.invoke("/config/update", ...args),
  });
}

// type of IPC
// - r2m2r: renderer --(invoke)--> main --(handle)--> renderer
// - m2r: main --(sebContents.send)--> renderer

// interface IpcSpecR2M2R {
//   "/config/get": undefined;
//   "/config/update": undefined;
//   "/process/start": undefined;
//   "/process/stop": undefined;
//   "/status/get": undefined;
// }

// interface IpcSpecM2R {
//   "/change": undefined;
// }

//
// [interface]
//
// in renderer
//
//   const res = await r2m2r.invoke("/config/get", req);
//   const res = await r2m2r.invoke("/config/update", req);
//   const res = await r2m2r.invoke("/status/get", req);
//   const res = await r2m2r.invoke("/log/get", req);
//
//   m2r.on("/changed", (event) => {});
//

//
// in main
//
//   r2m2r.handle("/config/get", () => {})
//

main();
