import React, { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { AppHeader, HeaderBack } from "@/shared/ui";
import { BibleReader, useBiblePosition } from "@/widgets/scripture-browser";

/**
 * Full-screen, read-only Bible reader reached from the notes list header.
 * It starts at the book list; the editor browser still remembers the last
 * selected book and chapter through settings.lastBibleRef.
 */
export function BibleReaderPage() {
  const router = useRouter();
  const { onPositionChange } = useBiblePosition();
  const [title, setTitle] = useState("성경");

  return (
    <View className="flex-1 bg-bg">
      <AppHeader
        left={<HeaderBack label="노트" onPress={() => router.back()} />}
        title={title}
      />
      <BibleReader
        insertMode="none"
        onPositionChange={onPositionChange}
        onTitleChange={(next) => setTitle(next)}
      />
    </View>
  );
}
