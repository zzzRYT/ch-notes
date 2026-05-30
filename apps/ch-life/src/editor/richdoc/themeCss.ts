import { scaled, type Theme } from "@/theme/ThemeProvider";

// Base body font size, scaled by the user's font-scale setting. 17px reads
// comfortably for the app's elder-friendly default; 1.6× pushes it to ~27px.
const BASE_FONT = 17;

// Builds the CSS that themes the WebView editor content to match the active
// app variation. Injected via editor.injectCSS with a stable tag so repeated
// injections replace rather than stack.
export function editorThemeCss(theme: Theme): string {
  const { colors, fontScale, fontStack } = theme;
  return `:root {
    --rt-ink: ${colors.ink};
    --rt-ink2: ${colors.ink2};
    --rt-ink3: ${colors.ink3};
    --rt-bg: ${colors.bg};
    --rt-accent: ${colors.accent};
    --rt-accent-soft: ${colors.accentSoft};
    --rt-rule: ${colors.rule};
    --rt-font: ${fontStack};
    --rt-font-size: ${scaled(BASE_FONT, fontScale)}px;
    --rt-line: 1.6;
  }
  body { background: ${colors.bg}; }`;
}
