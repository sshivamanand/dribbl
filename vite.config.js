import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "192.168.1.34", 
    port: 5173,
    https: {
      key: fs.readFileSync(path.resolve(__dirname, "ssl/private.key")),
      cert: fs.readFileSync(path.resolve(__dirname, "ssl/certificate.crt")),
    },
  },
});
