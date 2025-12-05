import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

export default defineConfig({
  base: '/', // ✅ prevent asset path mismatch
  plugins: [
    nitro(),
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
  build: {
    rollupOptions: {
      output: {
        // Use hash for cache busting - hash is based on content so it's consistent
        assetFileNames: (assetInfo) => {
          if (assetInfo.names?.includes('styles.css')) {
            return 'assets/app-[hash].css'
          }
          return 'assets/[name]-[hash][extname]'
        },
      },
    },
  },
})
