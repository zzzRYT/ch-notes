import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  KeyboardAwareScrollView,
  KeyboardStickyView,
} from 'react-native-keyboard-controller';
import { Bold, List, Underline } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { marksAt, type BlockNode, type InlineMark } from '@/entities/note';
import {
  detectRefAtCursor,
  replaceQuoteRef,
  splitParagraphWithQuote,
  type DetectedRef,
} from '@/features/scripture/insert';
import { useTheme } from '@/shared/ui';
import { QuoteBlock } from './QuoteBlock';
import { QuoteEditModal } from './QuoteEditModal';
import {
  ParagraphInput,
  type ActiveInputState,
  type ParagraphInputHandle,
} from './ParagraphInput';
import { firstParagraphIndex } from '../lib/field-nav';
import { splitBulletLines, toggleBullet, type BodyEdit } from '../lib/list-blocks';

type Props = {
  body: BlockNode[];
  onChangeBody: (next: BlockNode[]) => void;
  // Rendered at the top of the scroll content so it scrolls away with the
  // body instead of staying pinned above it.
  header?: React.ReactNode;
};

// Imperative handle so the meta header's last field can hand focus off into
// the body without the user tapping a paragraph.
export type NoteEditorHandle = {
  focusFirstParagraph: () => void;
};

export const NoteEditor = forwardRef<NoteEditorHandle, Props>(function NoteEditor(
  { body, onChangeBody, header },
  ref,
) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [active, setActive] = useState<ActiveInputState | null>(null);
  // Mounted text inputs by block index — the meta→body focus handoff and the
  // format toolbar reach the input through these.
  const inputs = useRef(new Map<number, ParagraphInputHandle>());
  const firstParaIdx = firstParagraphIndex(body);
  const firstParaIdxRef = useRef(firstParaIdx);
  firstParaIdxRef.current = firstParaIdx;

  useImperativeHandle(
    ref,
    () => ({
      focusFirstParagraph: () =>
        inputs.current.get(firstParaIdxRef.current)?.focus(),
    }),
    [],
  );
  // Bumped on edits that add or drop blocks (lists, quote insertion). Inputs are keyed by
  // index and ignore outside text while focused, so a split would leave the
  // focused one showing its old text; a new generation remounts them all from
  // the fresh body and focusOnMount puts the caret where the edit says.
  const [gen, setGen] = useState(0);
  // Index of the paragraph that should focus itself on its next mount — set
  // when a quote is inserted so the caret lands in the paragraph below it.
  const [focusOnMountIdx, setFocusOnMountIdx] = useState<number | null>(null);

  // Keep a live ref to body so ParagraphInput callbacks can stay stable
  // across renders. ParagraphInput is memoized — if we depended on `body`
  // in useCallback, every keystroke that commits would invalidate the
  // callback and bust the memo on every sibling block.
  const bodyRef = useRef<BlockNode[]>(body);
  bodyRef.current = body;

  // The focus-on-mount only fires once (mount-only effect in ParagraphInput),
  // so after the post-quote paragraph has grabbed focus we clear the target —
  // otherwise an unrelated remount at the same index (e.g. after a
  // backspace-merge) could steal focus later.
  useEffect(() => {
    if (focusOnMountIdx !== null) setFocusOnMountIdx(null);
  }, [focusOnMountIdx]);

  const handleCommit = useCallback(
    (idx: number, text: string): void => {
      const cur = bodyRef.current;
      const prev = cur[idx];
      // Every text block keeps its own type (bullet, and heading/todo from
      // imported markdown) — only the text changes.
      if (!prev || prev.type === 'quote') return;
      if (prev.text === text) return;
      const next = cur.slice();
      next[idx] = { ...prev, text };
      onChangeBody(next);
    },
    [onChangeBody],
  );

  const handleTrigger = useCallback(
    (idx: number, textBefore: string, detected: DetectedRef): void => {
      const updated = splitParagraphWithQuote(
        bodyRef.current,
        idx,
        textBefore,
        detected,
      );
      if (!updated) return;
      setActive(null);
      setFocusOnMountIdx(idx + 2);
      // With blocks below, the paragraph at idx + 2 already exists under the
      // same index key and would never mount — so the caret would not move.
      setGen((g) => g + 1);
      onChangeBody(updated);
    },
    [onChangeBody],
  );

  const handleActiveChange = useCallback(
    (state: ActiveInputState | null): void => {
      setActive(state);
    },
    [],
  );

  const applyListEdit = useCallback(
    (edit: BodyEdit | null): void => {
      if (!edit) return;
      setActive(null);
      setFocusOnMountIdx(edit.focusIdx);
      setGen((g) => g + 1);
      onChangeBody(edit.body);
    },
    [onChangeBody],
  );

  const handleNewline = useCallback(
    (idx: number, text: string): void => {
      applyListEdit(splitBulletLines(bodyRef.current, idx, text));
    },
    [applyListEdit],
  );

  const handleBackspaceAtStart = useCallback(
    (idx: number, tailText: string): void => {
      const cur = bodyRef.current;
      // Backspace at the start of a bullet ends the bullet first, like any
      // list editor; a quote above is only removed on the next backspace.
      if (cur[idx]?.type === 'bullet') {
        applyListEdit(toggleBullet(cur, idx, tailText, 0));
        return;
      }
      if (idx <= 0) return;
      const quote = cur[idx - 1];
      if (!quote || quote.type !== 'quote') return;

      const head = idx >= 2 ? cur[idx - 2] : null;
      const next = cur.slice();
      if (head && head.type === 'paragraph') {
        next.splice(idx - 2, 3, {
          type: 'paragraph',
          text: head.text + tailText,
        });
      } else {
        next[idx] = { type: 'paragraph', text: tailText };
        next.splice(idx - 1, 1);
      }
      setActive(null);
      onChangeBody(next);
    },
    [onChangeBody, applyListEdit],
  );

  // 참조를 고치는 중인 인용의 위치(RULE-EDIT-014).
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const editingQuote = editingIdx === null ? null : body[editingIdx];

  const handleReplaceQuote = useCallback(
    (ref: string): void => {
      if (editingIdx === null) return;
      const next = replaceQuoteRef(bodyRef.current, editingIdx, ref);
      setEditingIdx(null);
      if (next) onChangeBody(next);
    },
    [editingIdx, onChangeBody],
  );

  const handleMark = useCallback((mark: InlineMark): void => {
    if (active) inputs.current.get(active.idx)?.applyMark(mark);
  }, [active]);

  const handleToggleBullet = useCallback((): void => {
    if (active) {
      applyListEdit(toggleBullet(bodyRef.current, active.idx, active.text, active.cursor));
    }
  }, [active, applyListEdit]);

  const liveHint = active
    ? detectRefAtCursor(active.text, active.cursor)
    : null;

  return (
    <View className="flex-1">
      <KeyboardAwareScrollView
        // 서드파티 컴포넌트라 className이 닿지 않는다 — 배경만 style로.
        style={{ backgroundColor: colors.bg }}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        bottomOffset={KEYBOARD_BOTTOM_OFFSET}
      >
        {header}
        <View className="px-6 pt-3 gap-1">
          {body.map((block, idx) => {
            if (block.type === 'quote') {
              return (
                <QuoteBlock
                  key={`${gen}-q-${idx}`}
                  {...block}
                  onPress={() => setEditingIdx(idx)}
                />
              );
            }
            const isBullet = block.type === 'bullet';
            return (
              <ParagraphInput
                key={`${gen}-p-${idx}`}
                ref={(h) => {
                  if (h) inputs.current.set(idx, h);
                  else inputs.current.delete(idx);
                }}
                idx={idx}
                bullet={isBullet}
                onNewline={isBullet ? handleNewline : undefined}
                initialText={block.text}
                isFirst={idx === 0}
                focusOnMount={focusOnMountIdx === idx}
                onCommit={handleCommit}
                onTrigger={handleTrigger}
                onActiveChange={handleActiveChange}
                onBackspaceAtStart={handleBackspaceAtStart}
              />
            );
          })}
        </View>
      </KeyboardAwareScrollView>
      <QuoteEditModal
        quote={editingQuote?.type === 'quote' ? editingQuote : null}
        onClose={() => setEditingIdx(null)}
        onReplace={handleReplaceQuote}
      />
      {active && (
        <KeyboardStickyView
          className="absolute left-0 right-0 bottom-0"
          // 키보드가 닫혀 있으면(하드웨어 키보드) 홈 인디케이터 위로 올린다.
          offset={{ closed: -insets.bottom }}
        >
          <FormatToolbar
            marks={marksAt(active.text, active.cursor)}
            bullet={body[active.idx]?.type === 'bullet'}
            onMark={handleMark}
            onBullet={handleToggleBullet}
          />
        </KeyboardStickyView>
      )}
      {liveHint && (
        <View
          className="absolute left-0 right-0 items-center"
          style={{ bottom: 25 + insets.bottom }}
          pointerEvents="none"
        >
          <View className="flex-row items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-accent-soft">
            <View className="size-1.5 rounded-3 bg-accent" />
            <Text className="text-caption font-semibold text-accent">
              {liveHint.ref}
            </Text>
            <View className="px-[5px] py-px rounded-4 ml-1 bg-paper">
              <Text className="text-caption font-medium text-ink-2">space</Text>
            </View>
            <Text className="text-caption text-ink-3">↵</Text>
          </View>
        </View>
      )}
    </View>
  );
});

// 키보드 위에 붙는 서식 툴바(RULE-EDIT-015). 어르신 UX — 버튼마다 44pt 이상,
// 켜진 서식은 accent 배경으로 보인다. 기울임은 두지 않는다 — 한글에는 기울임
// 자형이 없어 눌러도 화면에 아무 변화가 없다(저장 형식 `_…_`은 그대로 지원).
function FormatToolbar({
  marks,
  bullet,
  onMark,
  onBullet,
}: {
  marks: InlineMark[];
  bullet: boolean;
  onMark: (mark: InlineMark) => void;
  onBullet: () => void;
}) {
  const { colors } = useTheme();
  const buttons = [
    { key: 'bold', label: '굵게', Icon: Bold, on: marks.includes('bold'), press: () => onMark('bold') },
    { key: 'underline', label: '밑줄', Icon: Underline, on: marks.includes('underline'), press: () => onMark('underline') },
    { key: 'bullet', label: '글머리 목록', Icon: List, on: bullet, press: onBullet },
  ];
  return (
    <View className="flex-row justify-around px-4 py-1.5 border-t-hairline border-rule bg-paper">
      {buttons.map(({ key, label, Icon, on, press }) => (
        <Pressable
          key={key}
          onPress={press}
          accessibilityRole="button"
          accessibilityLabel={label}
          accessibilityState={{ selected: on }}
          className={`w-14 h-11 rounded-8 items-center justify-center active:opacity-60 ${on ? 'bg-accent-soft' : ''}`}
        >
          <Icon size={22} color={on ? colors.accent : colors.ink} />
        </Pressable>
      ))}
    </View>
  );
}

const TOOLBAR_HEIGHT = 56;
const KEYBOARD_BOTTOM_OFFSET = 56 + TOOLBAR_HEIGHT;

const styles = StyleSheet.create({
  content: { paddingBottom: 80 },
});
