import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://lytelode-1.onrender.com',
        changeOrigin: true,
      },
    },
  },
  // Added build configuration for production
  build: {
    outDir: 'dist',
    sourcemap: false, 
  },
  define: {
    'process.env.VITE_API_BASE_URL': JSON.stringify(process.env.VITE_API_BASE_URL),
  }
})