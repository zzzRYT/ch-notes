import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { View } from 'react-native';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  DEFAULT_TOOLBAR_ITEMS,
  RichText,
  TenTapStartKit,
  Toolbar,
  useBridgeState,
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

  const editor = useEditorBridge({
    customSource: editorHtml,
    initialContent,
    avoidIosKeyboard: true,
    bridgeExtensions: BRIDGES,
    // 기본 toolbarBody가 flex:1이라 높이 없는 KeyboardStickyView 안에서 0으로 접힌다.
    theme: { webview: { backgroundColor: colors.bg }, toolbar: { toolbarBody: { flex: 0 } } },
  });

  useEffect(() => {
    setVerseResolver(({ before, pos }, bridge) => {
      const hit = detectRefAtCursor(before, before.length);
      const verses = hit && lookupVerses(hit.ref);
      if (!hit || !verses) return;
      const headLen = before.slice(0, hit.start).replace(/\s+$/, '').length;
      bridge.resolveVerse({
        pos,
        cut: before.length - headLen,
        refText: before.slice(headLen),
        block: JSON.stringify(makeQuoteBlock(hit.ref, verses, BUNDLED_EDITION_ID)),
        label: formatRef(hit.ref),
      });
    });
    return () => setVerseResolver(null);
  }, []);

  useImperativeHandle(ref, () => ({ focusFirstParagraph: () => editor.focus('start') }), [editor]);

  useEffect(() => {
    setDocListener((doc) => {
      const blocks = docToBlocks(doc);
      const key = JSON.stringify(blocks);
      if (key === shownRef.current) return;
      shownRef.current = key;
      onChangeBody(blocks);
    });
    return () => setDocListener(null);
  }, [onChangeBody]);

  // 노트는 비동기로 로드된다 — WebView가 준비되기 전의 setContent는 버려지므로 기다린다.
  const { isReady } = useBridgeState(editor);
  useEffect(() => {
    if (!isReady) return;
    const key = JSON.stringify(body);
    if (key === shownRef.current) return;
    shownRef.current = key;
    editor.setContent(blocksToDoc(body, formatRef));
  }, [body, editor, isReady]);

  const css = `:root{--rt-ink:${colors.ink};--rt-ink2:${colors.ink2};--rt-ink3:${colors.ink3};--rt-bg:${colors.bg};--rt-accent:${colors.accent};--rt-accent-soft:${colors.accentSoft};--rt-rule:${colors.rule};}body{background:${colors.bg};}`;
  useEffect(() => {
    editor.injectCSS(css, 'chlife-theme');
  }, [editor, css]);

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg }}>
      {header}
      <RichText editor={editor} onLoad={() => editor.injectCSS(css, 'chlife-theme')} />
      <KeyboardStickyView offset={{ closed: -insets.bottom }}>
        <Toolbar editor={editor} items={DEFAULT_TOOLBAR_ITEMS} />
      </KeyboardStickyView>
    </View>
  );
});
