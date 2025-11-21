import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 5173,
    headers: {
      // Required by FHEVM SDK for WebAssembly SharedArrayBuffer
      // Note: These headers may cause CORS warnings for third-party requests (e.g., Coinbase metrics)
      // These warnings are expected and don't affect FHEVM functionality
      "Cross-Origin-Embedder-Policy": "require-corp",
      // Changed from "same-origin" to "unsafe-none" to avoid conflict with Base Account SDK
      // FHEVM SDK still works with this setting
      "Cross-Origin-Opener-Policy": "unsafe-none",
    },
  },
  plugins: [
    react(),
    nodePolyfills({
      // Enable polyfills for Node.js modules
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      // Polyfill specific modules
      include: ["util", "stream", "crypto", "buffer"],
    }),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // Handle keccak module export issues
    conditions: ["import", "module", "browser", "default"],
  },
  define: {
    global: "globalThis",
    "process.env": {},
  },
  optimizeDeps: {
    exclude: ["@zama-fhe/relayer-sdk", "@zama-fhe/relayer-sdk/bundle", "@zama-fhe/relayer-sdk/web"],
    esbuildOptions: {
      target: "esnext",
    },
  },
}));
