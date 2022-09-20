import { ChildProcess, spawn } from "child_process";
import fs from "fs";
import {
  CommandStatus,
  Config,
  IPC_SERVICE_ENDPOINTS,
  IpcEventSend,
  IpcServiceServerApi,
} from "@-/common";
import { tinyassert } from "@-/common/lib/tinyassert";
import { BrowserWindow, app, ipcMain } from "electron";
import { createApplicationMenu } from "./application-menu";
import { addContextMenuHandler } from "./context-menu";
import { CONFIG_PATH, PRELOAD_JS_PATH, RENDERER_URL } from "./types";

export class MainApp {
  private window?: BrowserWindow;
  private processes: Map<string, ProcessWrapper> = new Map();

  async initialize() {
    await ensureConfig();
    this.initializeIpc();
    createApplicationMenu();
  }

  async start() {
    this.window = await createWindow();
  }

  initializeIpc() {
    const handlers: IpcServiceServerApi = {
      "/config/get": () => getConfig(),

      "/config/update": async (_event, config) => {
        await fs.promises.writeFile(
          CONFIG_PATH,
          JSON.stringify(config, null, 2)
        );
      },

      "/process/get": async (_event, { id }) => {
        const process = this.processes.get(id);
        return {
          status: process?.getStatus() ?? "idle",
          debug: app.isPackaged ? null : JSON.stringify(process, null, 2),
        };
      },

      "/process/update": async (_event, { id, type }) => {
        const config = await getConfig();
        const command = config.commands.find((command) => command.id === id);
        tinyassert(command, "invalid id");
        let process = this.processes.get(id);
        switch (type) {
          case "start": {
            if (process && process.getStatus() === "running") {
              throw new Error("invalid process status");
            }
            process ??= new ProcessWrapper();
            process.start(command.command).finally(() => {
              this.sendEvent("/change");
            });
            this.processes.set(id, process);
            this.sendEvent("/change");
            return;
          }
          case "stop": {
            if (!process || process.getStatus() !== "running") {
              throw new Error("invalid process status");
            }
            process.stop();
            this.sendEvent("/change");
            return;
          }
        }
      },

      // TODO: stream log update
      "/process/log/get": async (_event, { id }) => {
        return this.processes.get(id)?.log ?? "";
      },
    };
    for (const endpoint of IPC_SERVICE_ENDPOINTS) {
      ipcMain.handle(endpoint, handlers[endpoint]);
    }
  }

  sendEvent: IpcEventSend = (type, ...args) => {
    this.window?.webContents.send(type, ...args);
  };
}

async function getConfig(): Promise<Config> {
  const config = await fs.promises.readFile(CONFIG_PATH, "utf-8");
  return JSON.parse(config);
}

async function ensureConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    await fs.promises.writeFile(CONFIG_PATH, `{ "commands": [] }`);
  }
}

async function createWindow(): Promise<BrowserWindow> {
  const window = new BrowserWindow({
    webPreferences: {
      preload: PRELOAD_JS_PATH,
    },
  });
  window.webContents.once("dom-ready", () => {
    addContextMenuHandler(window);
  });
  await window.loadURL(RENDERER_URL);
  return window;
}

//
// process management
//

class ProcessWrapper {
  private process?: ChildProcess;
  public log: string = "";

  getStatus(): CommandStatus {
    if (!this.process) {
      return "idle";
    }
    if (this.process.killed) {
      return "success";
    }
    switch (this.process.exitCode) {
      case null: {
        return "running";
      }
      case 0: {
        return "success";
      }
    }
    return "error";
  }

  async start(command: string): Promise<void> {
    tinyassert(this.getStatus() !== "running");
    const process = spawn(command, {
      shell: true,
      stdio: ["ignore", "pipe", "pipe"],
    });
    this.process = process;
    return new Promise((resolve) => {
      tinyassert(process.stdout);
      tinyassert(process.stderr);
      process.stdout.on("data", (data) => {
        tinyassert(data instanceof Buffer);
        this.log += data.toString();
      });
      process.stderr.on("data", (data) => {
        tinyassert(data instanceof Buffer);
        this.log += data.toString();
      });
      process.on("error", () => {
        resolve();
      });
      process.on("close", () => {
        resolve();
      });
    });
  }

  async stop() {
    tinyassert(this.process);
    this.process.kill();
  }
}
