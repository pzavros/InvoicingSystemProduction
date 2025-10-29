import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import pkg from './package.json'

export default defineConfig({
  plugins: [react()],
  base: '/app/',
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5088',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
