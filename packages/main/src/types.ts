import path from "path";
import { app } from "electron";

export const CONFIG_PATH = path.resolve(app.getPath("userData"), "config.json");

export const PRELOAD_JS_PATH = path.resolve(__dirname, "index-preload.js");

export const RENDERER_URL =
  process.env["APP_RENDERER_URL"] ??
  new URL(`file://${__dirname}/../../renderer/dist/index.html`).toString();
