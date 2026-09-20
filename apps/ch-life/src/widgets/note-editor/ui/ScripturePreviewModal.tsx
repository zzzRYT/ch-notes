import React from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { makeQuoteBlock, type QuoteBlockNode } from "@/entities/note";
import { BUNDLED_EDITION_ID } from "@/entities/scripture";
import { validateScripture } from "@/features/scripture/insert";
import { useTheme } from "@/shared/ui";
import { QuoteBlock } from "./QuoteBlock";

type Props = {
  visible: boolean;
  scripture: string | null;
  onClose: () => void;
};

export function ScripturePreviewModal({
  visible,
  scripture,
  onClose,
}: Props) {
  const { colors } = useTheme();
  const verses = scripture ? validateScripture(scripture).verses : null;
  const previewBlock: QuoteBlockNode | null =
    scripture && verses
      ? makeQuoteBlock(scripture, verses, BUNDLED_EDITION_ID)
      : null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { backgroundColor: colors.paper }]}
          onPress={(e) => e.stopPropagation()}
        >
          <ScrollView contentContainerStyle={styles.content}>
            {previewBlock ? (
              <QuoteBlock {...previewBlock} />
            ) : (
              <Text style={[styles.empty, { color: colors.ink3 }]}>
                본문을 찾을 수 없습니다
              </Text>
            )}
          </ScrollView>
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="닫기"
            style={styles.closeBtn}
          >
            <Text style={[styles.closeText, { color: colors.accent }]}>
              닫기
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  sheet: {
    width: "100%",
    maxWidth: 420,
    maxHeight: "70%",
    borderRadius: 16,
    padding: 16,
  },
  content: {
    paddingVertical: 8,
  },
  empty: {
    textAlign: "center",
    paddingVertical: 24,
    fontSize: 14,
  },
  closeBtn: {
    alignSelf: "center",
    marginTop: 8,
    padding: 12,
  },
  closeText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
