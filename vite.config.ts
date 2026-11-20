import { defineConfig } from "vite";

// Betik etiketiyle ekleme için tek dosya (three içinde).
export default defineConfig({
  build: {
    lib: { entry: "src/auto.ts", name: "WebKedilerAuto", formats: ["iife"], fileName: () => "web-kediler.js" },
    outDir: "dist",
    emptyOutDir: false,
    minify: true,
    target: "es2020",
  },
});
