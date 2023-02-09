//
// model
//

import type { IpcMainInvokeEvent, IpcRendererEvent } from "electron";
import { IsEqual, staticAssert } from "./misc";

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
  "/process/get": {
    request: [{ id: string }];
    response: {
      status: CommandStatus;
      debug?: any;
    };
  };
  "/process/update": {
    request: [{ id: string; type: "start" | "stop" }];
    response: void;
  };
  "/process/log/get": {
    request: [{ id: string }];
    response: string;
  };
}

export const IPC_SERVICE_ENDPOINTS = [
  "/config/get",
  "/config/update",
  "/process/get",
  "/process/update",
  "/process/log/get",
] as const;

staticAssert<
  IsEqual<typeof IPC_SERVICE_ENDPOINTS[number], keyof IpcServiceSpec>
>();

export interface IpcEventSpec {
  "/change": [];
  "/log": [{ id: string; data: string }];
}

export const IPC_EVENT_ENDPOINTS = ["/change", "/log"] as const;

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

export type IpcEventHandler = {
  [K in keyof IpcEventSpec]: (
    event: IpcRendererEvent,
    ...args: IpcEventSpec[K]
  ) => void;
};

type IpcEventClientApi = {
  [K in keyof IpcEventSpec]: {
    on(handler: IpcEventHandler[K]): void;
    off(handler: IpcEventHandler[K]): void;
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

//
// re-exports
//

export * from "./misc";
