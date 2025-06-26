import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

// write your IP here
const YOUR_IP = "";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  server: {
    host: YOUR_IP, 
    port: 5173,
    https: {
      key: fs.readFileSync(path.resolve(__dirname, "ssl/private.key")),
      cert: fs.readFileSync(path.resolve(__dirname, "ssl/certificate.crt")),
    },
  },
});