import { resolveTheme } from '@/shared/ui';
import { editorThemeCss } from '../editor-theme';

jest.mock('uniwind', () => ({ Uniwind: { setTheme: jest.fn(), updateCSSVariables: jest.fn() } }));
const settings = { variation: 'paper', fontScale: 1.6, fontFamily: 'serif', blockStyle: 'default', accentChoice: '#1f8a5b' } as const;

test('노트 편집기에 선택한 글자 크기·글꼴·강조색과 인용 모양을 전달한다', () => {
  const css = editorThemeCss(resolveTheme(settings));
  expect(css).toContain('--rt-font-size:27px');
  expect(css).toContain('--rt-font:Noto Serif KR, serif');
  expect(css).toContain('--rt-accent:#1f8a5b');
  expect(css).toContain('border-left:3px solid #1f8a5b');
});

test('접은 본문은 접힘 테마에서만 숨기고 모양을 바꾸면 다시 보인다', () => {
  const css = (blockStyle: 'card' | 'quote' | 'collapse') => editorThemeCss(resolveTheme({ ...settings, blockStyle }));
  expect(css('collapse')).toContain('.verse-quote__toggle{display:inline-flex;}');
  expect(css('collapse')).toContain('.verse-quote[data-collapsed="true"] .verse-quote__row{display:none;}');
  for (const style of ['card', 'quote'] as const) {
    expect(css(style)).toContain('.verse-quote__toggle{display:none;}');
    expect(css(style)).toContain('.verse-quote[data-collapsed="true"] .verse-quote__row{display:flex;}');
  }
});
