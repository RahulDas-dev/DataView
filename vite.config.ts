import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production'

  // Base configuration shared across all modes
  const config = {
    base: '/DataView/',
    plugins: [react(), tailwindcss()],
    build: {}
  }

  // Add production-specific build options
  if (isProd) {
    config.build = {
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      },
      rollupOptions: {
        output: {
          manualChunks: {
            'plotly': ['plotly.js-dist-min'],
            'danfojs': ['danfojs'],
            'react-vendor': ['react', 'react-dom'],
            'ui-components': ['react-icons']
          }
        }
      }
    }
  }

  return config
})
