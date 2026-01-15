import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        newtab: "index.html",
        popup: "popup.html"
      }
    }
  }
})
