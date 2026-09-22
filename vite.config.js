import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendUrl = env.VITE_BACKEND_URL || 'http://localhost:8080'
  const frontendPort = Number(env.VITE_PORT || 3000)

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: frontendPort,
      proxy: {
        '/api': backendUrl,
        '/static': backendUrl,
        '/preview': backendUrl,
      },
    },
    build: {
      outDir: process.env.VERCEL ? 'dist' : '../backend/static',
      emptyOutDir: true,
    },
  }
})
