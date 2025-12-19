import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // for local dev: frontend/ -> project root
      "@artifacts": path.resolve(__dirname, "../artifacts"),
    },
  },
});
