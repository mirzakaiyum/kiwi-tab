import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { viteStaticCopy } from "vite-plugin-static-copy"

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    viteStaticCopy({
      targets: [
        {
          src: "manifest.json",
          dest: "."
        }
      ]
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split React into its own chunk
          'vendor-react': ['react', 'react-dom'],
          // Split animation library
          'vendor-motion': ['framer-motion'],
          // Split icon libraries
          'vendor-icons': ['lucide-react', 'react-icons'],
          // Split UI component libraries
          'vendor-ui': ['@radix-ui/react-label', '@base-ui/react', 'cmdk', 'vaul'],
        },
      },
    },
  },
})
