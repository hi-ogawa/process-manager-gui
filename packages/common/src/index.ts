//
// model
//

import type { IpcMainInvokeEvent, IpcRendererEvent } from "electron";
import { IsEqual, staticAssert } from "./misc";

// import { isEqual } from "./misc";

export interface Config {
  commands: Command[];
}

export interface Command {
  id: string;
  name: string;
  command: string;
}

export type CommandStatus = "success" | "error" | "running" | "idle";

//
// ipc
//

export interface IpcServiceSpec {
  "/config/get": {
    request: [];
    response: Config;
  };
  "/config/update": {
    request: [Config];
    response: void;
  };
  "/process/start": {
    request: [{ id: string }];
    response: void;
  };
  "/process/stop": {
    request: [{ id: string }];
    response: void;
  };
  "/status/get": {
    request: [{ id: string }];
    response: CommandStatus;
  };
}

export const IPC_SERVICE_ENDPOINTS = [
  "/config/get",
  "/config/update",
  "/process/start",
  "/process/stop",
  "/status/get",
] as const;

staticAssert<
  IsEqual<typeof IPC_SERVICE_ENDPOINTS[number], keyof IpcServiceSpec>
>();

export interface IpcEventSpec {
  "/change": [];
}

export const IPC_EVENT_ENDPOINTS = ["/change"] as const;

staticAssert<IsEqual<typeof IPC_EVENT_ENDPOINTS[number], keyof IpcEventSpec>>();

export type IpcServiceServerApi = {
  [K in keyof IpcServiceSpec]: (
    event: IpcMainInvokeEvent,
    ...arg: IpcServiceSpec[K]["request"]
  ) => Promise<IpcServiceSpec[K]["response"]>;
};

export type IpcServiceClientApi = {
  [K in keyof IpcServiceSpec]: (
    ...arg: IpcServiceSpec[K]["request"]
  ) => Promise<IpcServiceSpec[K]["response"]>;
};

export type IpcEventSend = <K extends keyof IpcEventSpec>(
  type: K,
  ...args: IpcEventSpec[K]
) => void;

type IpcEventClientApi = {
  [K in keyof IpcEventSpec]: {
    on(
      handler: (event: IpcRendererEvent, ...args: IpcEventSpec[K]) => void
    ): void;
    off(
      handler: (event: IpcRendererEvent, ...args: IpcEventSpec[K]) => void
    ): void;
  };
};

//
// preload script api
//

export interface PreloadApi {
  service: IpcServiceClientApi;
  event: IpcEventClientApi;
}

export const PRELOAD_API_NAME = "PRELOAD_API";
