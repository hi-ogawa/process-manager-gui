import { defineConfig } from "tsup";

export default defineConfig({
  // TODO: rename to main.ts, main-preload.ts, index.ts
  entry: ["src/index.ts", "src/index-preload.ts", "src/index-export.ts"],
  external: ["electron"],
  format: ["cjs"],
  sourcemap: "inline",
  dts: true, // for comlink service typing
});
