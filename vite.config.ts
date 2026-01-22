import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";
import packageJson from "./package.json";

// https://vite.dev/config/
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
  },
  plugins: [
    react(),
    tailwindcss(),
    viteStaticCopy({
      targets: [
        {
          src: "manifest.json",
          dest: ".",
          transform: (content) => {
            const manifest = JSON.parse(content.toString());
            manifest.version = packageJson.version;
            return JSON.stringify(manifest, null, 2);
          },
        },
        {
          src: "PRIVACY.md",
          dest: ".",
        },
      ],
    }),
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
          "vendor-react": ["react", "react-dom"],
          // Split animation library
          "vendor-motion": ["framer-motion"],
          // Split icon libraries
          "vendor-icons": ["lucide-react", "react-icons"],
          // Split UI component libraries
          "vendor-ui": ["@radix-ui/react-label", "cmdk", "vaul"],
        },
      },
    },
  },
});
