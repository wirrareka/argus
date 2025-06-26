import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import * as path from "node:path";
import tailwindcss from '@tailwindcss/vite';
import { copyFileSync, existsSync, mkdirSync } from 'fs'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'copy-wasm',
      generateBundle() {
        // Vytvor assets priečinok ak neexistuje
        const assetsDir = resolve(__dirname, 'dist/assets')
        if (!existsSync(assetsDir)) {
          mkdirSync(assetsDir, { recursive: true })
        }

        // Kopíruj WASM súbory - uprav cesty podľa tvojej štruktúry
         const wasmFiles = [
          'src/lib/gs-worker.wasm' // Ak je v src/assets
        ]

        wasmFiles.forEach(srcPath => {
          const fullSrcPath = resolve(__dirname, srcPath)
          if (existsSync(fullSrcPath)) {
            const fileName = srcPath.split('/').pop()
            copyFileSync(fullSrcPath, resolve(assetsDir, fileName ?? ''))
            console.log(`Copied ${fileName} to dist/assets/`)
          }
        })
      }
    }
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  worker: {
    format: 'es', // Zmena z 'iife' na 'es'
  },
  build: {
    target: 'esnext', // Podpora pre moderné ES features
  },
  optimizeDeps: {
    exclude: ['@your-wasm-package'], // Nahraď názvom tvojho WASM balíčka
  },
  server: {
    fs: {
      allow: ['..'] // Povolí prístup k WASM súborom
    }
  },
  assetsInclude: ['**/*.wasm'],
})
