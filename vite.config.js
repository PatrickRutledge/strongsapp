import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  publicDir: 'Public',
  base: './', // Use relative paths for assets
  server: {
    port: 5173,
    strictPort: true // This will fail if port 5173 is in use instead of trying another port
  },
  build: {
    outDir: 'dist'
  }
})
