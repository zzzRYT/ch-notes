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
  Text,
  TextInput,
  View,
  type NativeSyntheticEvent,
  type TextInputKeyPressEventData,
  type TextInputSelectionChangeEventData,
} from 'react-native';
import {
  detectTriggeredRef,
  splitAtRef,
  type DetectedRef,
} from '@/features/scripture/insert';
import {
  toggleInlineMark,
  tokenizeInlineMarks,
  type InlineMark,
} from '@/entities/note';

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
  // Toolbar B / I / U on the current selection (RULE-EDIT-010).
  applyMark: (mark: InlineMark) => void;
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
  // Set for single-line blocks (bullets): a newline hands the whole text to the
  // parent, which splits it into blocks instead of growing this one.
  onNewline?: (idx: number, text: string) => void;
  bullet?: boolean;
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
      onNewline,
      bullet = false,
    },
    ref,
  ) {
  const [text, setText] = useState<string>(initialText);
  const textRef = useRef<string>(initialText);
  const cursorRef = useRef<number>(initialText.length);
  const selectionStartRef = useRef<number>(initialText.length);
  const focusedRef = useRef<boolean>(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastCommittedRef = useRef<string>(initialText);
  const inputRef = useRef<TextInput>(null);

  // Latest-closure holder so the imperative handle can stay created once.
  const applyMarkRef = useRef<(mark: InlineMark) => void>(() => {});
  useImperativeHandle(
    ref,
    () => ({
      focus: () => inputRef.current?.focus(),
      applyMark: (mark) => applyMarkRef.current(mark),
    }),
    [],
  );

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
      if (onNewline && next.includes('\n')) {
        cancelDebounce();
        onNewline(idx, next);
        return;
      }
      setText(next);
      textRef.current = next;
      if (focusedRef.current) {
        onActiveChange({ idx, text: next, cursor: next.length });
      }
      scheduleCommit(next);
    },
    [idx, onTrigger, onActiveChange, onNewline, scheduleCommit],
  );

  applyMarkRef.current = (mark: InlineMark): void => {
    const edit = toggleInlineMark(
      textRef.current,
      selectionStartRef.current,
      cursorRef.current,
      mark,
    );
    setText(edit.text);
    textRef.current = edit.text;
    selectionStartRef.current = edit.start;
    cursorRef.current = edit.end;
    onActiveChange({ idx, text: edit.text, cursor: edit.end });
    scheduleCommit(edit.text);
    // The new text reaches the native view on the next frame; placing the
    // selection before that would land on the old string.
    requestAnimationFrame(() => inputRef.current?.setSelection(edit.start, edit.end));
  };

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
    <View className="flex-row">
      {bullet && <Text className={`w-6 ${TEXT_CLASS}`}>•</Text>}
    <TextInput
      className={`flex-1 min-h-[30px] py-0 align-top ${TEXT_CLASS}`}
      ref={inputRef}
      multiline
      onFocus={handleFocus}
      onBlur={handleBlur}
      onSelectionChange={handleSelectionChange}
      onChangeText={handleChangeText}
      onKeyPress={handleKeyPress}
      placeholder={
        isFirst && !bullet ? '예: 창1:1 라고 입력 후 space — 본문이 자동 삽입됩니다' : ''
      }
      placeholderTextColorClassName="text-ink-3"
      autoCorrect={false}
      autoCapitalize="none"
      spellCheck={false}
    >
      {renderInlineRuns(text)}
    </TextInput>
    </View>
  );
  },
);

// 본문 에디터 = body-large, 행간은 실측 editor 1.625(primitives.js)
const TEXT_CLASS = 'text-ink font-body text-body-large leading-[1.625]';

const MARK_CLASS: Record<InlineMark, string> = {
  bold: 'font-bold',
  italic: 'italic',
  underline: 'underline',
};

// The input's children are its value. Delimiters stay visible so the on-screen
// string is index-for-index the stored string — selection offsets need no
// mapping (ADR-0026). They are not dimmed: RN only re-applies child styles when
// the text changes, so a typed character keeps the style of the one before the
// caret, and a grey delimiter would turn everything typed after it grey.
function renderInlineRuns(text: string): React.ReactNode {
  const runs = tokenizeInlineMarks(text);
  if (runs.every((r) => !r.delimiter)) return text;
  return runs.map((r, i) => (
    <Text
      key={i}
      className={r.marks.map((m) => MARK_CLASS[m]).join(' ')}
    >
      {r.text}
    </Text>
  ));
}

export const ParagraphInput = memo(ParagraphInputImpl);

