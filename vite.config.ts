import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // Cambia '/johana-tatuajes-app/' por el nombre de tu repositorio en GitHub
  base: '/johana-tatuajes-app/', 
  plugins: [react()],
  define: {
    'process.env': process.env
  }
})