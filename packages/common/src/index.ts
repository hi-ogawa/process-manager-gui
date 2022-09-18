//
// model
//

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
  "/change": undefined;
}

//
// preload script api
//

export type IpcServiceApi = {
  [K in keyof IpcServiceSpec]: (
    ...arg: IpcServiceSpec[K]["request"]
  ) => Promise<IpcServiceSpec[K]["response"]>;
};

// TODO
export interface IpcEventApi {}

interface IpcEventClientApi {
  addEventListener<K extends keyof IpcEventSpec>(
    type: K,
    handler: (arg: IpcEventSpec[K]) => void
  ): void;
  removeEventListener<K extends keyof IpcEventSpec>(
    type: K,
    handler: (arg: IpcEventSpec[K]) => void
  ): void;
}

export interface PreloadApi {
  service: IpcServiceApi;
  event: IpcEventClientApi;
}

export const PRELOAD_API_NAME = "PRELOAD_API";
