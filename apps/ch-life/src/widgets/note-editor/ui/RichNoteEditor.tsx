import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { Animated, View } from 'react-native';
import { KeyboardEvents, KeyboardStickyView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  DEFAULT_TOOLBAR_ITEMS,
  RichText,
  TenTapStartKit,
  Toolbar,
  useEditorBridge,
} from '@10play/tentap-editor';
import { makeQuoteBlock, type BlockNode } from '@/entities/note';
import { BUNDLED_EDITION_ID, formatRef, lookupVerses } from '@/entities/scripture';
import { detectRefAtCursor } from '@/features/scripture/insert';
import { useTheme } from '@/shared/ui';
import { editorHtml } from '../lib/generated/editor-html';
import { DocSyncBridge, setDocListener } from '../lib/doc-sync-bridge';
import { blocksToDoc, docToBlocks } from '../lib/rich-doc';
import { setVerseResolver, VerseQuoteBridge } from '../lib/verse-bridge';

const BRIDGES = [...TenTapStartKit, VerseQuoteBridge, DocSyncBridge];

type Props = {
  body: BlockNode[];
  onChangeBody: (next: BlockNode[]) => void;
  header?: React.ReactNode;
};

export type NoteEditorHandle = { focusFirstParagraph: () => void };

// WebView(TipTap) 본문 에디터 — ADR-0001을 뒤집는 스파이크. 에디터가 편집 중의
// 정본이고, 문서 JSON을 BlockNode[]로 바꿔 onChangeBody로 내보낸다.
export const RichNoteEditor = forwardRef<NoteEditorHandle, Props>(function RichNoteEditor(
  { body, onChangeBody, header },
  ref,
) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  // 에디터 안에 지금 들어 있는 본문. 에디터가 보낸 변경(메아리)과 바깥 변경을 가른다.
  const shownRef = useRef(JSON.stringify(body));

  const initialContent = useMemo(
    () => blocksToDoc(body, formatRef),
    // 마운트 때 한 번. 이후 동기화는 아래 effect가 한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const css = `:root{--rt-ink:${colors.ink};--rt-ink2:${colors.ink2};--rt-ink3:${colors.ink3};--rt-bg:${colors.bg};--rt-accent:${colors.accent};--rt-accent-soft:${colors.accentSoft};--rt-rule:${colors.rule};}body{background:${colors.bg};}`;
  // 테마 CSS를 HTML에 처음부터 넣는다 — 로드 뒤 주입하면 기본 색으로 한 번 그려졌다
  // 바뀌며 깜빡인다. 마운트 때 한 번만 만든다(바꾸면 WebView가 다시 로드된다).
  // 태그는 injectCSS와 같은 data-tag라서 이후 테마 변경은 이 <style>을 덮어쓴다.
  const source = useMemo(
    () => editorHtml.replace('</head>', `<style data-tag="chlife-theme">${css}</style></head>`),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const editor = useEditorBridge({
    customSource: source,
    avoidIosKeyboard: true,
    initialContent,
    bridgeExtensions: BRIDGES,
    // 기본 toolbarBody가 flex:1이라 높이 없는 KeyboardStickyView 안에서 0으로 접힌다.
    theme: { webview: { backgroundColor: colors.bg }, toolbar: { toolbarBody: { flex: 0 } } },
  });

  useEffect(() => {
    setVerseResolver(({ before, pos, key }, bridge) => {
      const hit = detectRefAtCursor(before, before.length);
      const verses = hit && lookupVerses(hit.ref);
      if (!hit || !verses) return;
      const headLen = before.slice(0, hit.start).replace(/\s+$/, '').length;
      bridge.resolveVerse({
        pos,
        key,
        cut: before.length - headLen,
        refText: before.slice(headLen),
        block: JSON.stringify(makeQuoteBlock(hit.ref, verses, BUNDLED_EDITION_ID)),
        label: formatRef(hit.ref),
      });
    });
    return () => setVerseResolver(null);
  }, []);

  useImperativeHandle(ref, () => ({ focusFirstParagraph: () => editor.focus('start') }), [editor]);

  // 본문은 비동기로 로드되고, WebView는 준비되기 전의 setContent를 버린다.
  // 그래서 웹이 "준비됨"을 알릴 때 최신 본문을 넣고, 그 뒤의 바깥 변경만 밀어 넣는다.
  const readyRef = useRef(false);
  // 준비 전의 WebView는 빈 화면이나 반쯤 그린 문서다 — 가려 두었다가 페이드로 드러낸다.
  const fade = useRef(new Animated.Value(0)).current;
  const bodyRef = useRef(body);
  bodyRef.current = body;
  const push = useCallback(
    (next: BlockNode[]) => {
      shownRef.current = JSON.stringify(next);
      editor.setContent(blocksToDoc(next, formatRef));
    },
    [editor],
  );

  useEffect(() => {
    setDocListener({
      onReady: () => {
        readyRef.current = true;
        push(bodyRef.current);
        Animated.timing(fade, { toValue: 1, duration: 150, useNativeDriver: true }).start();
      },
      onDoc: (doc) => {
        const blocks = docToBlocks(doc);
        const key = JSON.stringify(blocks);
        if (key === shownRef.current) return;
        shownRef.current = key;
        onChangeBody(blocks);
      },
    });
    return () => setDocListener(null);
  }, [onChangeBody, push, fade]);

  useEffect(() => {
    if (readyRef.current && JSON.stringify(body) !== shownRef.current) push(body);
  }, [body, push]);

  // WebView는 키보드 뒤까지 깔린다 — 웹이 캐럿 아래 여백(CaretBottomRoom)을 잴 때
  // 가려진 높이를 빼도록 키보드 높이를 알려 준다. 타이핑 중이 아니라 키보드가 뜨고
  // 질 때만 주입하므로 한글 조합을 끊지 않는다.
  useEffect(() => {
    const send = (h: number) => {
      editor.injectJS(`window.__kbInset=${h};window.dispatchEvent(new Event('kbinset'));true;`);
    };
    const show = KeyboardEvents.addListener('keyboardDidShow', (e) => send(e.height));
    const hide = KeyboardEvents.addListener('keyboardDidHide', () => send(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, [editor]);

  useEffect(() => {
    editor.injectCSS(css, 'chlife-theme');
  }, [editor, css]);

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg }}>
      {header}
      <Animated.View style={{ flex: 1, opacity: fade }}>
        <RichText editor={editor} />
      </Animated.View>
      <KeyboardStickyView offset={{ closed: -insets.bottom }}>
        <Toolbar editor={editor} items={DEFAULT_TOOLBAR_ITEMS} />
      </KeyboardStickyView>
    </View>
  );
});
