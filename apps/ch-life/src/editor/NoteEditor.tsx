import React, { useCallback, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import type { BlockNode } from "@/domain/types";
import { QuoteBlock } from "./QuoteBlock";
import {
  ParagraphInput,
  type ActiveInputState,
} from "./ParagraphInput";
import { detectRefAtCursor, type DetectedRef } from "./useAutocomplete";
import { lookupVerses } from "@/parser/verse-lookup";
import { useTheme } from "@/theme/ThemeProvider";

type Props = {
  body: BlockNode[];
  onChangeBody: (next: BlockNode[]) => void;
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
  const head =
    current?.type === "paragraph"
      ? before.slice(0, ref.start).replace(/\s+$/, "")
      : "";
  const tail = current?.type === "paragraph" ? before.slice(ref.end) : "";
  next[idx] = { type: "paragraph", text: head };
  next.splice(
    idx + 1,
    0,
    { type: "quote", ref: ref.ref, verses, status: "loaded" },
    { type: "paragraph", text: tail },
  );
  return next;
}

export function NoteEditor({ body, onChangeBody }: Props) {
  const { colors } = useTheme();
  const [active, setActive] = useState<ActiveInputState | null>(null);

  // Keep a live ref to body so ParagraphInput callbacks can stay stable
  // across renders. ParagraphInput is memoized — if we depended on `body`
  // in useCallback, every keystroke that commits would invalidate the
  // callback and bust the memo on every sibling block.
  const bodyRef = useRef<BlockNode[]>(body);
  bodyRef.current = body;

  const handleCommit = useCallback(
    (idx: number, text: string): void => {
      const cur = bodyRef.current;
      const prev = cur[idx];
      if (prev?.type !== "paragraph") return;
      if (prev.text === text) return;
      const next = cur.slice();
      next[idx] = { type: "paragraph", text };
      onChangeBody(next);
    },
    [onChangeBody],
  );

  const handleTrigger = useCallback(
    (idx: number, textBefore: string, detected: DetectedRef): void => {
      const cur = bodyRef.current;
      const staged = cur.slice();
      staged[idx] = { type: "paragraph", text: textBefore };
      const updated = splitParagraphWithQuote(
        staged,
        idx,
        textBefore,
        detected,
      );
      if (updated) onChangeBody(updated);
    },
    [onChangeBody],
  );

  const handleActiveChange = useCallback(
    (state: ActiveInputState | null): void => {
      setActive(state);
    },
    [],
  );

  // Backspace at column 0 of a paragraph that directly follows a quote
  // removes the quote. When there is also a paragraph before the quote,
  // the two surrounding paragraphs are merged so the deletion undoes the
  // earlier split caused by quote insertion.
  const handleBackspaceAtStart = useCallback(
    (idx: number, tailText: string): void => {
      const cur = bodyRef.current;
      if (idx <= 0) return;
      const quote = cur[idx - 1];
      if (!quote || quote.type !== "quote") return;

      const head = idx >= 2 ? cur[idx - 2] : null;
      const next = cur.slice();
      if (head && head.type === "paragraph") {
        next.splice(idx - 2, 3, {
          type: "paragraph",
          text: head.text + tailText,
        });
      } else {
        next[idx] = { type: "paragraph", text: tailText };
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
      <ScrollView
        style={{ backgroundColor: colors.bg }}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {body.map((block, idx) => {
          if (block.type === "quote") {
            return <QuoteBlock key={`q-${idx}`} {...block} />;
          }
          return (
            <ParagraphInput
              key={`p-${idx}`}
              idx={idx}
              initialText={block.text}
              isFirst={idx === 0}
              onCommit={handleCommit}
              onTrigger={handleTrigger}
              onActiveChange={handleActiveChange}
              onBackspaceAtStart={handleBackspaceAtStart}
            />
          );
        })}
      </ScrollView>
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
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 24, paddingBottom: 80, gap: 4 },
  hintWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 10,
    alignItems: "center",
  },
  hint: {
    flexDirection: "row",
    alignItems: "center",
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
    fontWeight: "600",
  },
  hintKbd: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 4,
  },
  hintKbdText: {
    fontSize: 10,
    fontWeight: "500",
  },
  hintArrow: {
    fontSize: 11,
  },
});
