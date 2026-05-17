import React from "react";
import { ScrollView, TextInput, StyleSheet } from "react-native";
import type { BlockNode } from "@/domain/types";
import { QuoteBlock } from "./QuoteBlock";

type Props = {
  body: BlockNode[];
  onChangeBody: (next: BlockNode[]) => void;
};

export function NoteEditor({ body, onChangeBody }: Props) {
  return (
    <ScrollView contentContainerStyle={styles.root}>
      {body.map((block, idx) => {
        if (block.type === "quote") {
          return <QuoteBlock key={idx} {...block} />;
        }
        return (
          <TextInput
            key={idx}
            style={styles.paragraph}
            value={block.text}
            multiline
            onChangeText={(text) => {
              const next = body.slice();
              next[idx] = { type: "paragraph", text };
              onChangeBody(next);
            }}
            placeholder={idx === 0 ? "오늘의 설교를 적어보세요" : ""}
          />
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { padding: 16, gap: 8 },
  paragraph: { fontSize: 18, lineHeight: 26, minHeight: 28 },
});
