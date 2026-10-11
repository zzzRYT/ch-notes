import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Animated, Pressable, ScrollView, View } from 'react-native';
import { KeyboardEvents, KeyboardStickyView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  DEFAULT_TOOLBAR_ITEMS,
  PlaceholderBridge,
  RichText,
  TenTapStartKit,
  Toolbar,
  useEditorBridge,
} from '@10play/tentap-editor';
import { makeQuoteBlock, type BlockNode, type QuoteBlockNode } from '@/entities/note';
import { BUNDLED_EDITION_ID, formatRef, lookupVerses } from '@/entities/scripture';
import { detectRefAtCursor, replaceQuoteRef } from '@/features/scripture/insert';
import { useTheme } from '@/shared/ui';
import { editorHtml } from '../lib/generated/editor-html';
import { DocSyncBridge, setDocListener, type Caret } from '../lib/doc-sync-bridge';
import { blocksToDoc, docToBlocks, type PMDoc } from '../lib/rich-doc';
import {
  setVerseEditHandler,
  setVerseResolver,
  VerseQuoteBridge,
  type VerseEdit,
} from '../lib/verse-bridge';
import { EditorSkeleton } from './EditorSkeleton';
import { QuoteEditModal } from './QuoteEditModal';

// 빈 노트의 안내 문구는 editor-web/index.html의 CSS에 있다. 여기서 넣지 않는다 — tentap이
// 설정을 작은따옴표 JS 문자열 속 JSON으로 주입해 줄바꿈·따옴표가 JSON을 깨뜨리고 웹
// 에디터가 뜨지 않았다. 빈 문자열로 영어 기본값("Write something...")만 끈다.
const BRIDGES = [
  ...TenTapStartKit,
  PlaceholderBridge.configureExtension({ placeholder: '' }),
  VerseQuoteBridge,
  DocSyncBridge,
];
// tentap Toolbar 높이 — 키보드 위에 붙어 본문을 그만큼 더 가린다.
const TOOLBAR_H = 44;
// 타이핑 중인 캐럿 아래로 보이는 높이의 이만큼은 비워 둔다(맨 아래에 붙지 않게).
const CARET_BOTTOM_ROOM = 0.4;
// 웹 에디터가 뜨기 전 본문 자리 — 스켈레톤이 들어가고, 뜬 뒤 레이아웃이 튀지 않게 한다.
const BODY_MIN_H = 240;

type Props = {
  body: BlockNode[];
  onChangeBody: (next: BlockNode[]) => void;
  header?: React.ReactNode;
};

export type NoteEditorHandle = {
  focusFirstParagraph: () => void;
  /**
   * 에디터에 지금 들어 있는 본문. 웹뷰는 입력이 멈춘 뒤에야 RN으로 본문을 보내므로,
   * 화면을 떠나기 직전의 입력은 여기서 직접 읽는다. 읽지 못하면 null — 호출자는 RN 상태로 대신한다.
   */
  readBody: () => Promise<BlockNode[] | null>;
};

const READ_BODY_TIMEOUT_MS = 1000;

// WebView(TipTap) 본문 에디터 — ADR-0001을 뒤집는 스파이크. 에디터가 편집 중의
// 정본이고, 문서 JSON을 BlockNode[]로 바꿔 onChangeBody로 내보낸다.
// 웹뷰는 문서 높이만큼 늘어나고(dynamicHeight) 머리(header)와 함께 바깥 ScrollView
// 하나로 스크롤된다 — 머리가 화면 위에 고정되어 본문을 가리지 않는다.
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
    // 웹뷰가 스스로 스크롤하지 않으므로 키보드 회피·캐럿 따라가기는 아래 ScrollView가 한다.
    dynamicHeight: true,
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

  // 본문은 비동기로 로드되고, WebView는 준비되기 전의 setContent를 버린다.
  // 그래서 웹이 "준비됨"을 알릴 때 최신 본문을 넣고, 그 뒤의 바깥 변경만 밀어 넣는다.
  const readyRef = useRef(false);
  // 준비 전의 WebView는 빈 화면이나 반쯤 그린 문서다 — 스켈레톤을 보이다가 페이드로 바꾼다.
  const fade = useRef(new Animated.Value(0)).current;
  const [ready, setReady] = useState(false);

  useImperativeHandle(
    ref,
    () => ({
      focusFirstParagraph: () => editor.focus('start'),
      readBody: async () => {
        if (!readyRef.current) return null;
        try {
          // 웹뷰가 응답하지 않아도 화면을 못 떠나는 일이 없게 시간을 둔다.
          const doc = await Promise.race([
            editor.getJSON(),
            new Promise<null>((resolve) => setTimeout(() => resolve(null), READ_BODY_TIMEOUT_MS)),
          ]);
          return doc ? docToBlocks(doc as PMDoc) : null;
        } catch (e) {
          console.warn('read editor body failed', e);
          return null;
        }
      },
    }),
    [editor],
  );

  // 캐럿을 화면에 둔다. 좌표는 모두 ScrollView 콘텐츠 기준.
  const scrollRef = useRef<ScrollView>(null);
  const scrollY = useRef(0);
  const viewportH = useRef(0);
  const headerH = useRef(0);
  const kbH = useRef(0);
  const [kbPad, setKbPad] = useState(0);
  const caretRef = useRef<Caret | null>(null);
  const keepCaretVisible = useCallback(() => {
    const c = caretRef.current;
    if (!c || !viewportH.current) return;
    const visible = viewportH.current - kbH.current - TOOLBAR_H;
    const room = c.typing ? visible * CARET_BOTTOM_ROOM : 16;
    const top = headerH.current + c.top;
    const bottom = headerH.current + c.bottom;
    let y: number | null = null;
    if (bottom > scrollY.current + visible - room) y = bottom - visible + room;
    else if (top < scrollY.current + 8) y = top - 8;
    if (y !== null) scrollRef.current?.scrollTo({ y: Math.max(0, y), animated: true });
  }, []);
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
        setReady(true);
      },
      onCaret: (c) => {
        caretRef.current = c;
        keepCaretVisible();
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
  }, [onChangeBody, push, fade, keepCaretVisible]);

  // 준비됐어도 문서 높이가 오기 전엔 웹뷰 높이가 0이다 — 둘 다 된 뒤 스켈레톤과 바꾼다.
  const [webH, setWebH] = useState(0);
  const shown = ready && webH > 0;
  useEffect(() => {
    if (shown) Animated.timing(fade, { toValue: 1, duration: 150, useNativeDriver: true }).start();
  }, [shown, fade]);

  useEffect(() => {
    if (readyRef.current && JSON.stringify(body) !== shownRef.current) push(body);
  }, [body, push]);

  // 키보드가 가리는 만큼 본문 아래를 늘리고, 에디터에 캐럿이 있으면 그 위로 올린다.
  useEffect(() => {
    const set = (h: number) => {
      kbH.current = h;
      setKbPad(h);
      // caretRef는 에디터에 포커스가 있을 때만 차 있다(blur면 null).
      if (h) keepCaretVisible();
    };
    const show = KeyboardEvents.addListener('keyboardDidShow', (e) => set(e.height));
    const hide = KeyboardEvents.addListener('keyboardDidHide', () => set(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, [editor, keepCaretVisible]);

  // 인용 카드를 누르면 참조를 바꾸는 시트를 연다(RULE-EDIT-014).
  const [editing, setEditing] = useState<(VerseEdit & { quote: QuoteBlockNode }) | null>(null);
  useEffect(() => {
    setVerseEditHandler((e) => {
      editor.blur();
      setEditing({ ...e, quote: JSON.parse(e.block) as QuoteBlockNode });
    });
    return () => setVerseEditHandler(null);
  }, [editor]);
  const replaceQuote = useCallback(
    (ref: string) => {
      setEditing(null);
      if (!editing) return;
      const next = replaceQuoteRef([editing.quote], 0, ref)?.[0];
      if (next?.type !== 'quote') return;
      editor.replaceVerse({
        pos: editing.pos,
        block: editing.block,
        next: JSON.stringify(next),
        label: formatRef(next.ref),
      });
    },
    [editor, editing],
  );

  useEffect(() => {
    editor.injectCSS(css, 'chlife-theme');
  }, [editor, css]);

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg }}>
      <ScrollView
        ref={scrollRef}
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: kbPad + TOOLBAR_H }}
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={16}
        onScroll={(e) => {
          scrollY.current = e.nativeEvent.contentOffset.y;
        }}
        onLayout={(e) => {
          viewportH.current = e.nativeEvent.layout.height;
        }}
        // 타이핑으로 본문이 길어지면 웹뷰 높이가 뒤늦게 늘어난다 — 그때 다시 맞춘다.
        onContentSizeChange={() => {
          keepCaretVisible();
        }}
      >
        <View
          onLayout={(e) => {
            headerH.current = e.nativeEvent.layout.height;
          }}
        >
          {header}
        </View>
        <View style={{ minHeight: BODY_MIN_H }}>
          <Animated.View
            style={{ opacity: fade }}
            onLayout={(e) => setWebH(e.nativeEvent.layout.height)}
          >
            <RichText editor={editor} />
          </Animated.View>
          {!shown && (
            <View className="absolute inset-x-0 top-0">
              <EditorSkeleton />
            </View>
          )}
        </View>
        {/* 본문 아래 빈 곳을 눌러도 끝에서 이어 쓴다. */}
        <Pressable
          className="flex-grow"
          style={{ minHeight: 120 }}
          onPress={() => editor.focus('end')}
          accessible={false}
        />
      </ScrollView>
      <KeyboardStickyView offset={{ closed: -insets.bottom }}>
        <Toolbar editor={editor} items={DEFAULT_TOOLBAR_ITEMS} />
      </KeyboardStickyView>
      <QuoteEditModal
        quote={editing?.quote ?? null}
        onClose={() => setEditing(null)}
        onReplace={replaceQuote}
      />
    </View>
  );
});
