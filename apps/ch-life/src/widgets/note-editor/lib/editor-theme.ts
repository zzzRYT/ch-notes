import { scaled, type Theme } from '@/shared/ui';

export function editorThemeCss({ colors, fontStack, fontScale, blockStyle }: Theme): string {
  return `:root{--rt-ink:${colors.ink};--rt-ink2:${colors.ink2};--rt-ink3:${colors.ink3};--rt-bg:${colors.bg};--rt-accent:${colors.accent};--rt-accent-soft:${colors.accentSoft};--rt-rule:${colors.rule};--rt-font:${fontStack};--rt-font-size:${scaled(17, fontScale)}px;}
body{background:${colors.bg};}
.verse-quote{background:${blockStyle === 'quote' ? colors.accentSoft : colors.paper};border:1px solid ${colors.rule};border-left:${blockStyle === 'quote' ? `3px solid ${colors.accent}` : `1px solid ${colors.rule}`};}
.verse-quote__toggle{display:${blockStyle === 'collapse' ? 'inline-flex' : 'none'};}
.verse-quote[data-collapsed="true"] .verse-quote__row{display:${blockStyle === 'collapse' ? 'none' : 'flex'};}`;
}
