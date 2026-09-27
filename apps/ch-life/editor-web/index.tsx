import React from "react";
import { createRoot } from "react-dom/client";
import { AdvancedEditor } from "./AdvancedEditor";

declare global {
  interface Window {
    contentInjected: boolean | undefined;
  }
}

// On Android react-native-webview can inject content after window load
// (https://github.com/react-native-webview/react-native-webview/pull/2960).
// Wait until tentap has injected the initial content before mounting.
const contentInjected = () => window.contentInjected;
let interval: ReturnType<typeof setInterval>;
interval = setInterval(() => {
  if (!contentInjected()) return;
  const container = document.getElementById("root");
  const root = createRoot(container!);
  root.render(<AdvancedEditor />);
  clearInterval(interval);
}, 1);
