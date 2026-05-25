import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      { find: /^react$/, replacement: resolve(__dirname, "src/react-host-shim.ts") },
      { find: /^react\/jsx-dev-runtime$/, replacement: resolve(__dirname, "src/react-jsx-shim.ts") },
      { find: /^react\/jsx-runtime$/, replacement: resolve(__dirname, "src/react-jsx-shim.ts") },
    ],
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  build: {
    lib: {
      entry: "src/addon.tsx",
      fileName: () => "addon.js",
      formats: ["es"],
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
    outDir: "dist",
    minify: false,
    sourcemap: true,
  },
});
