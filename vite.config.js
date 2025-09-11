import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/components': resolve(__dirname, './src/components'),
      '@/views': resolve(__dirname, './src/views'),
      '@/stores': resolve(__dirname, './src/stores'),
      '@/services': resolve(__dirname, './src/services'),
      '@/composables': resolve(__dirname, './src/composables'),
      '@/utils': resolve(__dirname, './src/utils'),
      '@/types': resolve(__dirname, './src/types'),
      '@/assets': resolve(__dirname, './src/assets')
    }
  },
  server: {
    port: 3000,
    open: true,
    cors: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          ui: ['bootstrap', 'bootstrap-icons']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', 'axios']
  }
})
