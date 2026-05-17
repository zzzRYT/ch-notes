import React, { useState } from "react";
import {
  ScrollView,
  TextInput,
  StyleSheet,
  View,
  type NativeSyntheticEvent,
  type TextInputKeyPressEventData,
} from "react-native";
import type { BlockNode } from "@/domain/types";
import { QuoteBlock } from "./QuoteBlock";
import { RefChip } from "./RefChip";
import { detectRefAtCursor } from "./useAutocomplete";
import { lookupVerses } from "@/parser/verse-lookup";

type Props = {
  body: BlockNode[];
  onChangeBody: (next: BlockNode[]) => void;
};

export function NoteEditor({ body, onChangeBody }: Props) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [cursorMap, setCursorMap] = useState<Record<number, number>>({});

  const insertQuoteAfter = (idx: number, ref: string): void => {
    const verses = lookupVerses(ref);
    if (!verses) return;
    const next = body.slice();
    const current = next[idx];
    if (current?.type === "paragraph") {
      // 칩 확정 시 ref 텍스트를 paragraph에서 제거 (start..end 범위)
      const cursor = cursorMap[idx] ?? current.text.length;
      const detected = detectRefAtCursor(current.text, cursor);
      if (detected) {
        next[idx] = {
          type: "paragraph",
          text:
            current.text.slice(0, detected.start) +
            current.text.slice(detected.end),
        };
      }
    }
    next.splice(
      idx + 1,
      0,
      { type: "quote", ref, verses, status: "loaded" },
      { type: "paragraph", text: "" },
    );
    onChangeBody(next);
  };

  const handleKeyPress = (
    idx: number,
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
  ): void => {
    if (e.nativeEvent.key !== "Tab") return;
    const block = body[idx];
    if (!block || block.type !== "paragraph") return;
    const cursor = cursorMap[idx] ?? block.text.length;
    const detected = detectRefAtCursor(block.text, cursor);
    if (!detected) return;
    insertQuoteAfter(idx, detected.ref);
  };

  return (
    <ScrollView contentContainerStyle={styles.root}>
      {body.map((block, idx) => {
        if (block.type === "quote") return <QuoteBlock key={idx} {...block} />;
        const cursor = cursorMap[idx] ?? block.text.length;
        const detected =
          activeIdx === idx ? detectRefAtCursor(block.text, cursor) : null;
        return (
          <View key={idx}>
            <TextInput
              style={styles.paragraph}
              value={block.text}
              multiline
              onFocus={() => setActiveIdx(idx)}
              onSelectionChange={(e) =>
                setCursorMap((m) => ({
                  ...m,
                  [idx]: e.nativeEvent.selection.end,
                }))
              }
              onChangeText={(text) => {
                const next = body.slice();
                next[idx] = { type: "paragraph", text };
                onChangeBody(next);
              }}
              onKeyPress={(e) => handleKeyPress(idx, e)}
              placeholder={idx === 0 ? "오늘의 설교를 적어보세요" : ""}
            />
            {detected && (
              <RefChip
                refLabel={detected.ref}
                onConfirm={() => insertQuoteAfter(idx, detected.ref)}
              />
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { padding: 16, gap: 8 },
  paragraph: { fontSize: 18, lineHeight: 26, minHeight: 28 },
});
