import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Three.js separat (größter Chunk)
          'three':     ['three'],
          // React Three Fiber + Drei zusammen
          'r3f':       ['@react-three/fiber', '@react-three/drei'],
          // React Core
          'react-core': ['react', 'react-dom'],
          // Routing
          'router':    ['react-router-dom'],
        },
      },
    },
    // Source Maps in Production ausschalten (Größe)
    sourcemap: false,
    // Inline kleinere Assets (<8KB)
    assetsInlineLimit: 8192,
  },
})
