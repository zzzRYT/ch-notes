/** @jest-environment jsdom */
import { Editor } from '@tiptap/core';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { resolveTheme } from '@/shared/ui';
import { VerseQuoteBridge } from '../verse-bridge';
import { editorThemeCss } from '../editor-theme';
import { VERSE_NODE } from '../rich-doc';

jest.mock('@10play/tentap-editor', () => ({
  BridgeExtension: class { constructor(config: object) { Object.assign(this, config); } },
}));
jest.mock('@/shared/ui', () => jest.requireActual('@/shared/ui/ThemeProvider'));
jest.mock('uniwind', () => ({ Uniwind: { setTheme: jest.fn(), updateCSSVariables: jest.fn() } }));

const settings = { variation: 'focus', fontScale: 1.2, fontFamily: 'sans', blockStyle: 'collapse', accentChoice: 'default' } as const;

test('구절을 접고 펼쳐도 노트는 그대로이며, 접기 버튼은 참조 편집을 열지 않는다', () => {
  const postMessage = jest.fn();
  Object.assign(window, { ReactNativeWebView: { postMessage } });
  const element = document.createElement('div');
  const style = document.createElement('style');
  style.textContent = editorThemeCss(resolveTheme(settings));
  document.head.append(style);
  document.body.append(element);
  const editor = new Editor({
    element,
    extensions: [Document, Paragraph, Text, VerseQuoteBridge.tiptapExtension!],
    content: { type: 'doc', content: [{ type: VERSE_NODE, attrs: {
      label: '시편 23:1', block: JSON.stringify({ verses: [{ verse: 1, text: '여호와는 나의 목자시니' }] }),
    } }] },
  });
  const before = editor.getJSON();
  const quote = element.querySelector<HTMLElement>('.verse-quote')!;
  const toggle = element.querySelector<HTMLButtonElement>('button')!;
  const row = element.querySelector<HTMLElement>('.verse-quote__row')!;
  expect(toggle.getAttribute('aria-expanded')).toBe('true');
  toggle.click();
  expect(toggle.getAttribute('aria-expanded')).toBe('false');
  expect(getComputedStyle(row).display).toBe('none');
  expect(postMessage).not.toHaveBeenCalled();
  expect(editor.getJSON()).toEqual(before);

  style.textContent = editorThemeCss(resolveTheme({ ...settings, blockStyle: 'card' }));
  expect(getComputedStyle(row).display).toBe('flex');
  expect(getComputedStyle(toggle).display).toBe('none');
  style.textContent = editorThemeCss(resolveTheme(settings));
  toggle.click();
  expect(toggle.getAttribute('aria-expanded')).toBe('true');
  expect(getComputedStyle(row).display).not.toBe('none');
  quote.click();
  expect(JSON.parse(postMessage.mock.lastCall![0]).type).toBe('verse-edit');
  expect(editor.getJSON()).toEqual(before);
  editor.destroy();
  element.remove();
  style.remove();
});
