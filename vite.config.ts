import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
base:"/Collaborative_study_platform/",
  plugins: [react()],
})
