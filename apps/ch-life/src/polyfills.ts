// React Native's Hermes engine has no global `Buffer`, but gray-matter (used by
// note import/export in src/markdown) references it. Install the polyfill before
// any module that pulls in gray-matter loads. This runs first from index.js,
// ahead of expo-router/entry, so the global exists before any screen mounts.
import { Buffer } from "buffer";

const globalScope = globalThis as typeof globalThis & { Buffer?: typeof Buffer };
if (typeof globalScope.Buffer === "undefined") {
  globalScope.Buffer = Buffer;
}
