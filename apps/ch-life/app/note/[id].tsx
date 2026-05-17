import React, { useState } from "react";
import { View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { NoteEditor } from "@/editor/NoteEditor";
import type { BlockNode } from "@/domain/types";

export default function NoteEditorScreen() {
  const { id: _id } = useLocalSearchParams<{ id: string }>();
  const [body, setBody] = useState<BlockNode[]>([
    { type: "paragraph", text: "" },
    {
      type: "quote",
      ref: "골 3:20",
      verses: [
        {
          book: "Col",
          chapter: 3,
          verse: 20,
          text:
            "자녀들아 모든 일에 부모에게 순종하라 이는 주 안에서 기쁘게 하는 것이니라",
        },
      ],
      status: "loaded",
    },
    { type: "paragraph", text: "" },
  ]);

  return (
    <View style={{ flex: 1 }}>
      <NoteEditor body={body} onChangeBody={setBody} />
    </View>
  );
}
