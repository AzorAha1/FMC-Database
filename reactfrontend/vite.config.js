import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    allowedHosts: [
      'localhost:5173',
      'hrmanagement.local',
      '100.0.1.60',
      '192.168.1.105',
    ],
    strictPort: false,
    watch: {
      usePolling: true
    }
  }
})
