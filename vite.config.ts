import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// NearBuy web app — dev server binds 0.0.0.0 for live preview and accepts any host.
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    cors: true,
    allowedHosts: true,
  } as unknown as { host: string; port: number; strictPort: boolean; cors: boolean },
  preview: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
  } as unknown as { host: string; port: number },
})
