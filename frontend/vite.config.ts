import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const isGitHubPages = process.env.VITE_APP_GITHUB_PAGES === 'true'
  
  return {
    plugins: [react()],
    base: isGitHubPages ? '/agentcare/' : '/',
    server: {
      port: 3001,
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
        '/health': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        }
      }
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
      assetsDir: 'assets',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            mui: ['@mui/material', '@mui/icons-material'],
          }
        }
      }
    },
    resolve: {
      alias: {
        '@': '/src',
      },
    },
  }
}) 