import React, {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  TextInput,
  StyleSheet,
  type NativeSyntheticEvent,
  type TextInputKeyPressEventData,
  type TextInputSelectionChangeEventData,
} from 'react-native';
import { useTheme, scaled } from '@/theme/ThemeProvider';
import {
  detectTriggeredRef,
  splitAtRef,
  type DetectedRef,
} from './useAutocomplete';

const COMMIT_DEBOUNCE_MS = 800;

export type ActiveInputState = {
  idx: number;
  text: string;
  cursor: number;
};

// Imperative handle so a parent (e.g. the meta-header → body focus handoff)
// can move the caret into an already-mounted paragraph without touch.
export type ParagraphInputHandle = {
  focus: () => void;
};

type Props = {
  idx: number;
  initialText: string;
  isFirst: boolean;
  focusOnMount?: boolean;
  onCommit: (idx: number, text: string) => void;
  onTrigger: (idx: number, textBefore: string, detected: DetectedRef) => void;
  onActiveChange: (state: ActiveInputState | null) => void;
  onBackspaceAtStart: (idx: number, currentText: string) => void;
};

const ParagraphInputImpl = forwardRef<ParagraphInputHandle, Props>(
  function ParagraphInputImpl(
    {
      idx,
      initialText,
      isFirst,
      focusOnMount = false,
      onCommit,
      onTrigger,
      onActiveChange,
      onBackspaceAtStart,
    },
    ref,
  ) {
  const { colors, fontScale, fontStack } = useTheme();
  const [text, setText] = useState<string>(initialText);
  const textRef = useRef<string>(initialText);
  const cursorRef = useRef<number>(initialText.length);
  const selectionStartRef = useRef<number>(initialText.length);
  const focusedRef = useRef<boolean>(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastCommittedRef = useRef<string>(initialText);
  const inputRef = useRef<TextInput>(null);

  useImperativeHandle(ref, () => ({ focus: () => inputRef.current?.focus() }), []);

  useEffect(() => {
    if (!focusOnMount) return;
    const raf = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (focusedRef.current) return;
    if (initialText === text) return;
    setText(initialText);
    textRef.current = initialText;
    lastCommittedRef.current = initialText;
  }, [initialText, text]);

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
      // Diff against the previous value so a citation triggers wherever the
      // caret is — including mid-paragraph with text still below it — not only
      // when the reference sits at the very end of the field.
      const triggered = detectTriggeredRef(textRef.current, next);
      if (triggered) {
        const { detected, textWithoutTrigger } = triggered;
        const { head } = splitAtRef(textWithoutTrigger, detected);
        cancelDebounce();
        lastCommittedRef.current = head;
        setText(head);
        textRef.current = head;
        cursorRef.current = head.length;
        selectionStartRef.current = head.length;
        onActiveChange(null);
        onTrigger(idx, textWithoutTrigger, detected);
        return;
      }
      setText(next);
      textRef.current = next;
      if (focusedRef.current) {
        onActiveChange({ idx, text: next, cursor: next.length });
      }
      scheduleCommit(next);
    },
    [idx, onTrigger, onActiveChange, scheduleCommit],
  );

  const handleSelectionChange = useCallback(
    (e: NativeSyntheticEvent<TextInputSelectionChangeEventData>): void => {
      const { start, end } = e.nativeEvent.selection;
      selectionStartRef.current = start;
      cursorRef.current = end;
      if (focusedRef.current) {
        onActiveChange({ idx, text, cursor: end });
      }
    },
    [idx, text, onActiveChange],
  );

  const handleKeyPress = useCallback(
    (e: NativeSyntheticEvent<TextInputKeyPressEventData>): void => {
      if (e.nativeEvent.key !== 'Backspace') return;
      if (selectionStartRef.current !== 0 || cursorRef.current !== 0) return;
      const current = textRef.current;
      cancelDebounce();
      if (current !== lastCommittedRef.current) {
        lastCommittedRef.current = current;
      }
      onBackspaceAtStart(idx, current);
    },
    [idx, onBackspaceAtStart],
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
      textRef.current = text;
      onCommit(idx, text);
    }
  }, [idx, text, onCommit, onActiveChange]);

  return (
    <TextInput
      style={[
        styles.paragraph,
        {
          color: colors.ink,
          fontFamily: fontStack,
          fontSize: scaled(16, fontScale),
          lineHeight: scaled(26, fontScale),
        },
      ]}
      ref={inputRef}
      value={text}
      multiline
      onFocus={handleFocus}
      onBlur={handleBlur}
      onSelectionChange={handleSelectionChange}
      onChangeText={handleChangeText}
      onKeyPress={handleKeyPress}
      placeholder={
        isFirst ? '예: 창1:1 라고 입력 후 space — 본문이 자동 삽입됩니다' : ''
      }
      placeholderTextColor={colors.ink3}
      autoCorrect={false}
      autoCapitalize="none"
      spellCheck={false}
    />
  );
  },
);

export const ParagraphInput = memo(ParagraphInputImpl);

const styles = StyleSheet.create({
  paragraph: {
    minHeight: 30,
    paddingVertical: 0,
    textAlignVertical: 'top',
  },
});
