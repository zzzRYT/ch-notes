import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));

// Builds the WebView editor into a single inlined HTML file. tentap's web entry
// is aliased to its TypeScript source rather than the prebuilt `/web` bundle:
// the prebuilt one inlines its own TipTap/ProseMirror, so our extensions'
// `@tiptap/core` import shipped a second copy (~100KB). From source, both share
// one copy from node_modules.
export default defineConfig({
  root,
  build: {
    outDir: "build",
    emptyOutDir: true,
  },
  resolve: {
    alias: [
      { find: /^@\/(.*)$/, replacement: `${root}/../src/$1` },
      {
        find: /^@10play\/tentap-editor$/,
        replacement: `${root}/../node_modules/@10play/tentap-editor/src/webEditorUtils/index.ts`,
      },
    ],
  },
  plugins: [react(), viteSingleFile()],
  server: { port: 3000 },
});
