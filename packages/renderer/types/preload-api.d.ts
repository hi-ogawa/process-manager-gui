import type { COMLINK_API_NAME, PreloadApi } from "@-/common";

declare global {
  const PRELOAD_API: PreloadApi;
  const COMLINK_API: any;
}
