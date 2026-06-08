import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [vue()],
  publicDir: 'Public',
  // Electron loads index.html via file:// and needs RELATIVE asset paths ('./').
  // The Azure web build is served from the domain root and uses ABSOLUTE paths ('/').
  // Build Electron with `--mode electron` (see package.json) to get the relative base.
  base: mode === 'electron' ? './' : '/',
  server: {
    port: 5173,
    strictPort: true // This will fail if port 5173 is in use instead of trying another port
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  }
}))
