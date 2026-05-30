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
import type { BlockNode } from '@/domain/types';
import { QuoteBlock } from './QuoteBlock';
import {
  ParagraphInput,
  type ActiveInputState,
  type ParagraphInputHandle,
} from './ParagraphInput';
import {
  detectRefAtCursor,
  splitAtRef,
  type DetectedRef,
} from './useAutocomplete';
import { firstParagraphIndex } from './field-nav';
import { lookupVerses } from '@/parser/verse-lookup';
import { useTheme } from '@/theme/ThemeProvider';

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

function splitParagraphWithQuote(
  source: BlockNode[],
  idx: number,
  before: string,
  ref: DetectedRef,
): BlockNode[] | null {
  const verses = lookupVerses(ref.ref);
  if (!verses) return null;
  const next = source.slice();
  const current = next[idx];
  const { head, tail } =
    current?.type === 'paragraph'
      ? splitAtRef(before, ref)
      : { head: '', tail: '' };
  next[idx] = { type: 'paragraph', text: head };
  next.splice(
    idx + 1,
    0,
    { type: 'quote', ref: ref.ref, verses, status: 'loaded' },
    { type: 'paragraph', text: tail },
  );
  return next;
}

export const NoteEditor = forwardRef<NoteEditorHandle, Props>(function NoteEditor(
  { body, onChangeBody, header },
  ref,
) {
  const { colors } = useTheme();
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
    <View style={styles.root}>
      <KeyboardAwareScrollView
        style={{ backgroundColor: colors.bg }}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        bottomOffset={KEYBOARD_BOTTOM_OFFSET}
      >
        {header}
        <View style={styles.body}>
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
        <View style={styles.hintWrap} pointerEvents="none">
          <View style={[styles.hint, { backgroundColor: colors.accentSoft }]}>
            <View
              style={[styles.hintDot, { backgroundColor: colors.accent }]}
            />
            <Text style={[styles.hintLabel, { color: colors.accent }]}>
              {liveHint.ref}
            </Text>
            <View style={[styles.hintKbd, { backgroundColor: colors.paper }]}>
              <Text style={[styles.hintKbdText, { color: colors.ink2 }]}>
                space
              </Text>
            </View>
            <Text style={[styles.hintArrow, { color: colors.ink3 }]}>↵</Text>
          </View>
        </View>
      )}
    </View>
  );
});

const KEYBOARD_BOTTOM_OFFSET = 56;

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingBottom: 80 },
  body: { paddingHorizontal: 24, paddingTop: 12, gap: 4 },
  hintWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 25,
    alignItems: 'center',
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  hintDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  hintLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  hintKbd: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 4,
  },
  hintKbdText: {
    fontSize: 10,
    fontWeight: '500',
  },
  hintArrow: {
    fontSize: 11,
  },
});
