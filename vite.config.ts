import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import { TanStackStartVite } from "@tanstack/start/vite";

export default defineConfig({
  plugins: [
    tanstackStart({
      adapter: "vercel"
    }),
    TanStackRouterVite(),
    react(),
  ],
});
function tanstackStart(config: { adapter: string }): import("vite").PluginOption {
    return TanStackStartVite(config);
}
