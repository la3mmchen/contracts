import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: mode === 'production' && process.env.GITHUB_PAGES === 'true' ? '/contracts/' : '/',
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Optimize build for GitHub Pages
    target: 'es2015',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
    // Ensure consistent builds
    sourcemap: false,
    minify: 'esbuild',
    // Force esbuild for better compatibility
    ...(process.env.VITE_FORCE_ESBUILD === 'true' && {
      minify: 'esbuild',
      rollupOptions: {
        output: {
          manualChunks: undefined,
        },
      },
    }),
  },
  optimizeDeps: {
    // Force esbuild for dependency optimization
    esbuildOptions: {
      target: 'es2015',
    },
    // Disable Rollup for dependency optimization if forced
    ...(process.env.VITE_FORCE_ESBUILD === 'true' && {
      force: true,
    }),
  },
}));
