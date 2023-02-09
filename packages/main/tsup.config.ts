import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/index-preload.ts"],
  external: ["electron"],
  format: ["cjs"],
  sourcemap: "inline",
  dts: true, // for comlink service typing
});
