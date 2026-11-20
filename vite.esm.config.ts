import { defineConfig } from "vite";

// Paketleyicilerle kullanım için ES modülü (three dışarıda: sitenin kendi three'si kullanılır).
export default defineConfig({
  build: {
    lib: { entry: "src/index.ts", formats: ["es"], fileName: () => "web-kediler.mjs" },
    rollupOptions: { external: [/^three/] },
    outDir: "dist",
    emptyOutDir: false,
    minify: false,
    target: "es2020",
  },
});
