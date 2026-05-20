import React, {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  TextInput,
  StyleSheet,
  type NativeSyntheticEvent,
  type TextInputSelectionChangeEventData,
} from "react-native";
import { useTheme, scaled } from "@/theme/ThemeProvider";
import { EDITOR_ACCESSORY_ID } from "./EditorKeyboardToolbar";
import { detectRefAtCursor, type DetectedRef } from "./useAutocomplete";

const TRIGGER_RE = /[\s\n]$/;
const COMMIT_DEBOUNCE_MS = 800;

export type ActiveInputState = {
  idx: number;
  text: string;
  cursor: number;
};

type Props = {
  idx: number;
  initialText: string;
  isFirst: boolean;
  onCommit: (idx: number, text: string) => void;
  onTrigger: (idx: number, textBefore: string, detected: DetectedRef) => void;
  onActiveChange: (state: ActiveInputState | null) => void;
};

function ParagraphInputImpl({
  idx,
  initialText,
  isFirst,
  onCommit,
  onTrigger,
  onActiveChange,
}: Props) {
  const { colors, fontScale } = useTheme();
  const [text, setText] = useState<string>(initialText);
  const cursorRef = useRef<number>(initialText.length);
  const focusedRef = useRef<boolean>(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastCommittedRef = useRef<string>(initialText);

  // Sync local buffer when the paragraph text changes from the outside
  // (e.g. note load, external splice). Skip while focused to avoid
  // disrupting Android IME composition.
  useEffect(() => {
    if (focusedRef.current) return;
    if (initialText === text) return;
    setText(initialText);
    lastCommittedRef.current = initialText;
  }, [initialText, text]);

  // Flush any pending debounce on unmount so a paragraph that gets
  // spliced out still persists the latest text.
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const cancelDebounce = () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
  };

  const scheduleCommit = useCallback(
    (next: string) => {
      cancelDebounce();
      debounceRef.current = setTimeout(() => {
        if (next !== lastCommittedRef.current) {
          lastCommittedRef.current = next;
          onCommit(idx, next);
        }
      }, COMMIT_DEBOUNCE_MS);
    },
    [idx, onCommit],
  );

  const handleChangeText = useCallback(
    (next: string): void => {
      const grew = next.length > text.length;
      const lastChar = next.slice(-1);
      if (grew && TRIGGER_RE.test(lastChar)) {
        const detected = detectRefAtCursor(next, next.length - 1);
        if (detected) {
          const before = next.slice(0, next.length - 1);
          cancelDebounce();
          lastCommittedRef.current = before;
          setText(before);
          onActiveChange(null);
          onTrigger(idx, before, detected);
          return;
        }
      }
      setText(next);
      if (focusedRef.current) {
        onActiveChange({ idx, text: next, cursor: next.length });
      }
      scheduleCommit(next);
    },
    [idx, onTrigger, onActiveChange, scheduleCommit, text.length],
  );

  const handleSelectionChange = useCallback(
    (e: NativeSyntheticEvent<TextInputSelectionChangeEventData>): void => {
      const end = e.nativeEvent.selection.end;
      cursorRef.current = end;
      if (focusedRef.current) {
        onActiveChange({ idx, text, cursor: end });
      }
    },
    [idx, text, onActiveChange],
  );

  const handleFocus = useCallback((): void => {
    focusedRef.current = true;
    onActiveChange({ idx, text, cursor: cursorRef.current });
  }, [idx, text, onActiveChange]);

  const handleBlur = useCallback((): void => {
    focusedRef.current = false;
    onActiveChange(null);
    cancelDebounce();
    if (text !== lastCommittedRef.current) {
      lastCommittedRef.current = text;
      onCommit(idx, text);
    }
  }, [idx, text, onCommit, onActiveChange]);

  return (
    <TextInput
      style={[
        styles.paragraph,
        {
          color: colors.ink,
          fontSize: scaled(16, fontScale),
          lineHeight: scaled(26, fontScale),
        },
      ]}
      value={text}
      multiline
      onFocus={handleFocus}
      onBlur={handleBlur}
      onSelectionChange={handleSelectionChange}
      onChangeText={handleChangeText}
      placeholder={
        isFirst
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
}

export const ParagraphInput = memo(ParagraphInputImpl);

const styles = StyleSheet.create({
  paragraph: {
    minHeight: 30,
    paddingVertical: 0,
    textAlignVertical: "top",
  },
});
