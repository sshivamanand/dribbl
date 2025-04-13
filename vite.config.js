import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "192.168.56.1", // ← This makes it accessible on your local network
    port: 5173, // Optional: Change the port if you want
  },
});
