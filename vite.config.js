import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Proxy API requests to the Express server defined in server.js
    // Note: In this setup, Express runs *within* the Vite dev server process.
    // If running separately, you'd use proxy options like:
    // proxy: {
    //   '/api': {
    //     target: 'http://localhost:3001', // Your separate backend port
    //     changeOrigin: true,
    //   }
    // }
  }
})
