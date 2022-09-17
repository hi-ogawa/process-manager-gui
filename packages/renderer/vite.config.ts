import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import windicss from "vite-plugin-windicss";

export default defineConfig({
  plugins: [windicss(), react()],
});
