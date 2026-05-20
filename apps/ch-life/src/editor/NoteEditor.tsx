import React, { useState, useCallback } from "react";
import {
  ScrollView,
  TextInput,
  StyleSheet,
  Text,
  View,
  type NativeSyntheticEvent,
  type TextInputKeyPressEventData,
  type TextInputSelectionChangeEventData,
} from "react-native";
import type { BlockNode } from "@/domain/types";
import { QuoteBlock } from "./QuoteBlock";
import { detectRefAtCursor, type DetectedRef } from "./useAutocomplete";
import { lookupVerses } from "@/parser/verse-lookup";
import { useTheme, scaled } from "@/theme/ThemeProvider";
import { EDITOR_ACCESSORY_ID } from "./EditorKeyboardToolbar";

type Props = {
  body: BlockNode[];
  onChangeBody: (next: BlockNode[]) => void;
};

const TRIGGER_RE = /[\s\n]$/;

function splitParagraphWithQuote(
  source: BlockNode[],
  idx: number,
  ref: DetectedRef,
): BlockNode[] | null {
  const verses = lookupVerses(ref.ref);
  if (!verses) return null;
  const next = source.slice();
  const current = next[idx];
  if (current?.type === "paragraph") {
    const before = current.text.slice(0, ref.start).replace(/\s+$/, "");
    const after = current.text.slice(ref.end);
    next[idx] = { type: "paragraph", text: before };
    next.splice(
      idx + 1,
      0,
      { type: "quote", ref: ref.ref, verses, status: "loaded" },
      { type: "paragraph", text: after },
    );
  } else {
    next.splice(
      idx + 1,
      0,
      { type: "quote", ref: ref.ref, verses, status: "loaded" },
      { type: "paragraph", text: "" },
    );
  }
  return next;
}

export function NoteEditor({ body, onChangeBody }: Props) {
  const { colors, fontScale } = useTheme();
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [cursorMap, setCursorMap] = useState<Record<number, number>>({});

  const handleChangeText = useCallback(
    (idx: number, text: string): void => {
      const prev = body[idx];
      const prevText = prev?.type === "paragraph" ? prev.text : "";
      const grew = text.length > prevText.length;
      const lastChar = text.slice(-1);
      // Treat a newly-typed trailing space or newline as the convert trigger.
      // The trigger char is dropped — the user wanted a quote block, not a
      // stray space/newline.
      if (grew && TRIGGER_RE.test(lastChar)) {
        const detected = detectRefAtCursor(text, text.length - 1);
        if (detected) {
          const staged = body.slice();
          staged[idx] = {
            type: "paragraph",
            text: text.slice(0, text.length - 1),
          };
          const updated = splitParagraphWithQuote(staged, idx, detected);
          if (updated) {
            onChangeBody(updated);
            return;
          }
        }
      }
      const next = body.slice();
      next[idx] = { type: "paragraph", text };
      onChangeBody(next);
    },
    [body, onChangeBody],
  );

  const handleKeyPress = useCallback(
    (
      idx: number,
      e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    ): void => {
      if (e.nativeEvent.key !== "Tab") return;
      const block = body[idx];
      if (!block || block.type !== "paragraph") return;
      const cursor = cursorMap[idx] ?? block.text.length;
      const detected = detectRefAtCursor(block.text, cursor);
      if (!detected) return;
      e.preventDefault?.();
      const updated = splitParagraphWithQuote(body, idx, detected);
      if (updated) onChangeBody(updated);
    },
    [body, cursorMap, onChangeBody],
  );

  const handleSelectionChange = useCallback(
    (
      idx: number,
      e: NativeSyntheticEvent<TextInputSelectionChangeEventData>,
    ): void => {
      // Read out of the synthetic event synchronously — React may null its
      // fields before the state updater runs (event pooling).
      const end = e.nativeEvent.selection.end;
      setCursorMap((m) => ({ ...m, [idx]: end }));
    },
    [],
  );

  const activeBlock = activeIdx !== null ? body[activeIdx] : undefined;
  const activeText =
    activeBlock?.type === "paragraph" ? activeBlock.text : "";
  const activeCursor =
    activeIdx !== null ? (cursorMap[activeIdx] ?? activeText.length) : 0;
  const liveHint =
    activeIdx !== null
      ? detectRefAtCursor(activeText, activeCursor)
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
            return <QuoteBlock key={idx} {...block} />;
          }
          return (
            <TextInput
              key={idx}
              style={[
                styles.paragraph,
                {
                  color: colors.ink,
                  fontSize: scaled(16, fontScale),
                  lineHeight: scaled(26, fontScale),
                },
              ]}
              value={block.text}
              multiline
              onFocus={() => setActiveIdx(idx)}
              onSelectionChange={(e) => handleSelectionChange(idx, e)}
              onChangeText={(text) => handleChangeText(idx, text)}
              onKeyPress={(e) => handleKeyPress(idx, e)}
              placeholder={
                idx === 0
                  ? "예: 창1:1 라고 입력 후 space — 본문이 자동 삽입됩니다"
                  : ""
              }
              placeholderTextColor={colors.ink3}
              autoCorrect={false}
              autoCapitalize="none"
              spellCheck={false}
              inputAccessoryViewID={EDITOR_ACCESSORY_ID}
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
  paragraph: {
    minHeight: 30,
    paddingVertical: 0,
    textAlignVertical: "top",
  },
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
