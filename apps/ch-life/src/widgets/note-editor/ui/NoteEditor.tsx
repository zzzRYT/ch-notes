import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BlockNode } from '@/entities/note';
import {
  detectRefAtCursor,
  splitParagraphWithQuote,
  type DetectedRef,
} from '@/features/scripture/insert';
import { useTheme } from '@/shared/ui';
import { QuoteBlock } from './QuoteBlock';
import {
  ParagraphInput,
  type ActiveInputState,
  type ParagraphInputHandle,
} from './ParagraphInput';
import { firstParagraphIndex } from '../lib/field-nav';

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
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [active, setActive] = useState<ActiveInputState | null>(null);
  // Ref to the first paragraph block so we can focus it on the meta→body handoff.
  const firstParaRef = useRef<ParagraphInputHandle>(null);
  const firstParaIdx = firstParagraphIndex(body);

  useImperativeHandle(
    ref,
    () => ({ focusFirstParagraph: () => firstParaRef.current?.focus() }),
    [],
  );
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
      if (prev?.type !== 'paragraph') return;
      if (prev.text === text) return;
      const next = cur.slice();
      next[idx] = { type: 'paragraph', text };
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

  const handleBackspaceAtStart = useCallback(
    (idx: number, tailText: string): void => {
      const cur = bodyRef.current;
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
    [onChangeBody],
  );

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
              return <QuoteBlock key={`q-${idx}`} {...block} />;
            }
            return (
              <ParagraphInput
                key={`p-${idx}`}
                ref={idx === firstParaIdx ? firstParaRef : undefined}
                idx={idx}
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

const KEYBOARD_BOTTOM_OFFSET = 56;

const styles = StyleSheet.create({
  content: { paddingBottom: 80 },
});
