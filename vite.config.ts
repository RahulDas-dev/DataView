import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  base: '/DataView/',
  envDir:'env',
  envPrefix: ['VITE_','DB_'],
  plugins: [react()],
  server: {
    port: 1430,
    strictPort: true,
  },
  build: {
    target: ["es2015", "chrome100", "safari13"],
    outDir: './build',
    minify: true,
    sourcemap: true,
  }
})
