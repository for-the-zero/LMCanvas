import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    base: './',
    plugins: [react()],
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        rollupOptions: {
            input: {
                canvas: './renderer/canvas.html',
                controller: './renderer/controller.html'
            }
        }
    },
    server: {
        port: 5173,
        strictPort: true,
    },
    resolve: {},
})
