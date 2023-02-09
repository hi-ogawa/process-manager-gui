import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/index-preload.ts"],
  format: ["cjs"]
});
