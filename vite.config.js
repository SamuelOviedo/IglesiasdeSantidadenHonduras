import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    // mapbox-gl es un motor de mapas (~1.7 MB) y se emite en su propio chunk.
    // Ese tamaño es esperado, así que subimos el umbral del aviso para no verlo.
    chunkSizeWarningLimit: 1800,
  },
})