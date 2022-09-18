type PreloadApi = {
  "/config/get": () => Promise<Config>;
  "/config/update": (arg: Config) => Promise<void>;
};

declare const PRELOAD_API: PreloadApi;

interface Config {
  commands?: Command[];
}

interface Command {
  id: string;
  name: string;
  command: string;
}

type CommandStatus = "success" | "error" | "running" | "idle";
