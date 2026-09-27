import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
} from "react-native";
import { makeQuoteBlock, type QuoteBlockNode } from "@/entities/note";
import { BUNDLED_EDITION_ID } from "@/entities/scripture";
import {
  replaceQuoteRef,
  validateScripture,
} from "@/features/scripture/insert";
import { QuoteBlock } from "./QuoteBlock";

type Props = {
  /** 고칠 인용. `null`이면 닫혀 있다. */
  quote: QuoteBlockNode | null;
  onClose: () => void;
  onReplace: (ref: string) => void;
};

/** 인용 카드의 참조를 다시 입력해 바꾼다(RULE-EDIT-014). 본문은 고칠 수 없다. */
export function QuoteEditModal({ quote, onClose, onReplace }: Props) {
  const [draft, setDraft] = useState("");
  useEffect(() => {
    if (quote) setDraft(quote.ref);
  }, [quote]);

  const { verses } = validateScripture(draft);
  const preview = verses
    ? makeQuoteBlock(draft.trim(), verses, BUNDLED_EDITION_ID)
    : null;
  // 조회되고 지금 인용과 다른 구절일 때만 바꿀 수 있다.
  const canReplace =
    quote !== null && replaceQuoteRef([quote], 0, draft) !== null;

  return (
    <Modal
      visible={quote !== null}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable
          className="flex-1 bg-black/35 items-center justify-center p-6"
          onPress={onClose}
        >
          <Pressable
            className="w-full max-w-[420px] max-h-[85%] rounded-16 p-5 gap-3 bg-paper"
            onPress={(e) => e.stopPropagation()}
          >
            <Text
              accessibilityRole="header"
              className="font-extrabold text-ink text-title"
            >
              인용 고치기
            </Text>
            <TextInput
              className="px-3 py-2.5 rounded-8 bg-chip-bg text-ink text-body-large"
              value={draft}
              onChangeText={setDraft}
              placeholder="예: 요 3:16-18"
              placeholderTextColorClassName="text-ink-3"
              autoCorrect={false}
              autoCapitalize="none"
              autoFocus
              returnKeyType="done"
              onSubmitEditing={() => canReplace && onReplace(draft.trim())}
              accessibilityLabel="성경 참조"
            />
            <ScrollView className="shrink">
              {preview ? (
                <QuoteBlock {...preview} />
              ) : (
                <Text className="text-center py-6 text-label text-ink-3">
                  찾을 수 없는 구절입니다
                </Text>
              )}
            </ScrollView>
            {/* POL-A11Y-001 — 탭 타깃 44~48px. */}
            <Pressable
              onPress={() => onReplace(draft.trim())}
              disabled={!canReplace}
              accessibilityRole="button"
              accessibilityLabel="이 구절로 바꾸기"
              accessibilityState={{ disabled: !canReplace }}
              className={`${BTN} ${canReplace ? "bg-ink" : "bg-chip-bg"}`}
            >
              <Text
                className={`font-bold text-body ${
                  canReplace ? "text-paper" : "text-ink-3"
                }`}
              >
                바꾸기
              </Text>
            </Pressable>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="닫기"
              className={`${BTN} border border-chip-bg`}
            >
              <Text className="font-semibold text-ink-2 text-body">닫기</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const BTN = "min-h-[52px] rounded-12 items-center justify-center px-4";
