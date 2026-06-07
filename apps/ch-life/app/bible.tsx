import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/theme/ThemeProvider";
import { AppHeader } from "@/chrome/AppHeader";
import { HeaderBack } from "@/chrome/HeaderControls";
import { BibleReader } from "@/browser/BibleReader";
import { useBiblePosition } from "@/browser/useBiblePosition";

/**
 * Full-screen, read-only Bible reader reached from the notes list header.
 * Unlike the editor's modal browser, there is no insert affordance here —
 * this is purely for reading (insertMode="none"). Reading position is shared
 * with the editor modal via useBiblePosition (settings.lastBibleRef).
 */
export default function BibleScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { initialRef, onPositionChange } = useBiblePosition();
  const [title, setTitle] = useState("성경");

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
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

const styles = StyleSheet.create({
  root: { flex: 1 },
});
