import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server:{allowedHosts: ["14aa-2409-40c4-11e5-89f4-d086-cced-7f31-a5c4.ngrok-free.app"]},
})
