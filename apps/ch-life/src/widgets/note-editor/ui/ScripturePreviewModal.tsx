import React from "react";
import { Modal, Pressable, ScrollView, Text } from "react-native";
import { makeQuoteBlock, type QuoteBlockNode } from "@/entities/note";
import { BUNDLED_EDITION_ID } from "@/entities/scripture";
import { validateScripture } from "@/features/scripture/insert";
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
      <Pressable
        className="flex-1 bg-black/35 items-center justify-center p-6"
        onPress={onClose}
      >
        <Pressable
          className="w-full max-w-[420px] max-h-[70%] rounded-16 p-4 bg-paper"
          onPress={(e) => e.stopPropagation()}
        >
          <ScrollView contentContainerClassName="py-2">
            {previewBlock ? (
              <QuoteBlock {...previewBlock} />
            ) : (
              <Text className="text-center py-6 text-label text-ink-3">
                본문을 찾을 수 없습니다
              </Text>
            )}
          </ScrollView>
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="닫기"
            className="self-center mt-2 p-3"
          >
            <Text className="text-label font-semibold text-accent">닫기</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

