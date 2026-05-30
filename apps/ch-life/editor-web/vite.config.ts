import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));

// Builds the WebView editor into a single inlined HTML file. The aliases force
// Vite to load tentap's prebuilt web bundle (and the matching ProseMirror
// view/state singletons) instead of pulling in React-Native code paths.
export default defineConfig({
  root,
  build: {
    outDir: "build",
    emptyOutDir: true,
  },
  resolve: {
    alias: [
      {
        find: "@10play/tentap-editor",
        replacement: "@10play/tentap-editor/web",
      },
      {
        find: "@tiptap/pm/view",
        replacement: "@10play/tentap-editor/web",
      },
      {
        find: "@tiptap/pm/state",
        replacement: "@10play/tentap-editor/web",
      },
    ],
  },
  plugins: [react(), viteSingleFile()],
  server: { port: 3000 },
});
