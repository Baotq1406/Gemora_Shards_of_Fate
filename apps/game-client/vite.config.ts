import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 8080,
    strictPort: true,
    proxy: { "/api": { target: "http://127.0.0.1:3000", changeOrigin: true } },
    open: true,
  },
});
