import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Packages the Wealthfolio 3.6+ sandbox provides at runtime — must not be bundled.
const HOST_EXTERNALS = [
  "react",
  "react-dom",
  "react-dom/client",
  "react/jsx-runtime",
  "react/jsx-dev-runtime",
  "lucide-react",
  "@wealthfolio/addon-sdk",
];

export default defineConfig({
  plugins: [react(), tailwindcss()],
  esbuild: {
    jsxDev: false,
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
      external: HOST_EXTERNALS,
      output: {
        inlineDynamicImports: true,
      },
    },
    outDir: "dist",
    minify: false,
    sourcemap: true,
  },
});
