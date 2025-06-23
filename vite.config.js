import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "10.1.16.251", 
    port: 5173,
    https: {
      key: fs.readFileSync(path.resolve(__dirname, "ssl/private.key")),
      cert: fs.readFileSync(path.resolve(__dirname, "ssl/certificate.crt")),
    },
  },
});
