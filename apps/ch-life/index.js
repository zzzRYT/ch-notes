// Custom entry point. Load polyfills (Buffer for gray-matter) before
// expo-router boots, so globals exist before any screen — and its markdown
// import/export dependencies — are imported.
import "./src/polyfills";
import "expo-router/entry";
