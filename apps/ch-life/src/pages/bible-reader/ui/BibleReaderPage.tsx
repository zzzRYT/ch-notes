import React, { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { AppHeader, HeaderBack } from "@/shared/ui";
import { BibleReader, useBiblePosition } from "@/widgets/scripture-browser";

/**
 * Full-screen, read-only Bible reader reached from the notes list header.
 * Unlike the editor's modal browser, there is no insert affordance here —
 * this is purely for reading (insertMode="none"). Reading position is shared
 * with the editor modal via useBiblePosition (settings.lastBibleRef).
 */
export function BibleReaderPage() {
  const router = useRouter();
  const { initialRef, onPositionChange } = useBiblePosition();
  const [title, setTitle] = useState("성경");

  return (
    <View className="flex-1 bg-bg">
      <AppHeader
        left={<HeaderBack label="노트" onPress={() => router.back()} />}
        title={title}
      />
      <BibleReader
        insertMode="none"
        initialRef={initialRef}
        onPositionChange={onPositionChange}
        onTitleChange={(next) => setTitle(next)}
      />
    </View>
  );
}

