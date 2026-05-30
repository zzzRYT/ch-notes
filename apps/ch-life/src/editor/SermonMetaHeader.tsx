import React, { useEffect, useRef, useState, type RefObject } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Calendar } from "lucide-react-native";
import { useTheme, scaled } from "@/theme/ThemeProvider";
import { parseFlexibleDate, todayYmd } from "./calendar";
import { validateScripture } from "./scripture-field";
import { nextMetaField, type MetaFieldKey } from "./field-nav";
import { DatePickerModal } from "./DatePickerModal";
import { ScripturePreviewModal } from "./ScripturePreviewModal";

export type SermonMetaHeaderProps = {
  title: string | null;
  sermonDate: string | null;
  preacher: string | null;
  location: string | null;
  scripture: string | null;
  onChangeTitle: (v: string | null) => void;
  onChangeSermonDate: (v: string | null) => void;
  onChangePreacher: (v: string | null) => void;
  onChangeLocation: (v: string | null) => void;
  onChangeScripture: (v: string | null) => void;
  // Called when Return is pressed on the last meta field, to hand focus off
  // to the note body without the user tapping a paragraph.
  onSubmitLast?: () => void;
};

function toNull(v: string): string | null {
  return v.length === 0 ? null : v;
}

export function SermonMetaHeader(props: SermonMetaHeaderProps) {
  const { colors, fontScale, fontStack } = useTheme();
  const [dateOpen, setDateOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  // The date field is keyboard-typeable: the user can type a date and Return
  // through it. `dateText` holds the editable string; it syncs back to the
  // normalized ISO value coming from props (note load / picker selection).
  const [dateText, setDateText] = useState(props.sermonDate ?? "");
  const dateFocusedRef = useRef(false);
  useEffect(() => {
    if (dateFocusedRef.current) return;
    setDateText(props.sermonDate ?? "");
  }, [props.sermonDate]);

  // One ref per text field so Return can move focus to the next one.
  const titleRef = useRef<TextInput>(null);
  const dateRef = useRef<TextInput>(null);
  const preacherRef = useRef<TextInput>(null);
  const locationRef = useRef<TextInput>(null);
  const scriptureRef = useRef<TextInput>(null);

  const refByField: Record<MetaFieldKey, RefObject<TextInput | null>> = {
    title: titleRef,
    date: dateRef,
    preacher: preacherRef,
    location: locationRef,
    scripture: scriptureRef,
  };

  function focusNext(from: MetaFieldKey): void {
    const target = nextMetaField(from);
    if (target === "body") {
      props.onSubmitLast?.();
      return;
    }
    refByField[target].current?.focus();
  }

  function commitDate(): void {
    const raw = dateText.trim();
    if (!raw) {
      props.onChangeSermonDate(null);
      setDateText("");
      return;
    }
    const refYear = Number(todayYmd().slice(0, 4));
    const parsed = parseFlexibleDate(raw, refYear);
    if (parsed) {
      props.onChangeSermonDate(parsed);
      setDateText(parsed);
    } else {
      // Unparseable — revert to the last known good value rather than storing junk.
      setDateText(props.sermonDate ?? "");
    }
  }

  // A calendar pick wins over whatever is being typed in the date field. We
  // sync the editable text and clear the focus guard so a later blur won't
  // re-commit the stale typed value over the picked date.
  function handlePickDate(ymd: string): void {
    dateFocusedRef.current = false;
    props.onChangeSermonDate(ymd);
    setDateText(ymd);
  }

  const scriptureValid =
    !!props.scripture && validateScripture(props.scripture).valid;

  const labelStyle = [
    styles.label,
    { color: colors.ink3, fontSize: scaled(13, fontScale) },
  ];
  const fieldText = {
    color: colors.ink,
    fontFamily: fontStack,
    fontSize: scaled(16, fontScale),
  };

  return (
    <View style={[styles.root, { borderBottomColor: colors.rule }]}>
      <View style={styles.row}>
        <Text style={labelStyle}>제목</Text>
        <TextInput
          ref={titleRef}
          style={[
            styles.input,
            fieldText,
            { fontWeight: "700", fontSize: scaled(20, fontScale) },
          ]}
          value={props.title ?? ""}
          onChangeText={(t) => props.onChangeTitle(toNull(t))}
          placeholder="설교 제목"
          placeholderTextColor={colors.ink3}
          accessibilityLabel="설교 제목"
          maxLength={120}
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => focusNext("title")}
        />
      </View>

      <View style={styles.row}>
        <Text style={labelStyle}>날짜</Text>
        <View style={styles.dateField}>
          <TextInput
            ref={dateRef}
            style={[styles.input, fieldText]}
            value={dateText}
            onChangeText={setDateText}
            onFocus={() => {
              dateFocusedRef.current = true;
            }}
            onBlur={() => {
              dateFocusedRef.current = false;
              commitDate();
            }}
            placeholder="예: 2026-05-30"
            placeholderTextColor={colors.ink3}
            accessibilityLabel="설교 날짜"
            keyboardType="numbers-and-punctuation"
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={10}
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => {
              commitDate();
              focusNext("date");
            }}
          />
          <Pressable
            onPress={() => setDateOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="달력에서 날짜 선택"
            hitSlop={8}
            style={({ pressed }) => [
              styles.dateBtn,
              {
                backgroundColor: colors.accentSoft,
                borderColor: colors.rule,
                opacity: pressed ? 0.6 : 1,
              },
            ]}
          >
            <Calendar
              size={scaled(18, fontScale)}
              color={colors.accent}
              strokeWidth={2}
            />
          </Pressable>
        </View>
      </View>

      <View style={styles.row}>
        <Text style={labelStyle}>설교자</Text>
        <TextInput
          ref={preacherRef}
          style={[styles.input, fieldText]}
          value={props.preacher ?? ""}
          onChangeText={(t) => props.onChangePreacher(toNull(t))}
          placeholder="설교자 이름"
          placeholderTextColor={colors.ink3}
          accessibilityLabel="설교자"
          maxLength={60}
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => focusNext("preacher")}
        />
      </View>

      <View style={styles.row}>
        <Text style={labelStyle}>장소</Text>
        <TextInput
          ref={locationRef}
          style={[styles.input, fieldText]}
          value={props.location ?? ""}
          onChangeText={(t) => props.onChangeLocation(toNull(t))}
          placeholder="예배 장소"
          placeholderTextColor={colors.ink3}
          accessibilityLabel="장소"
          maxLength={60}
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => focusNext("location")}
        />
      </View>

      <View style={[styles.row, styles.lastRow]}>
        <Text style={labelStyle}>생명양식</Text>
        <View style={styles.scriptureField}>
          <TextInput
            ref={scriptureRef}
            style={[styles.input, styles.scriptureInput, fieldText]}
            value={props.scripture ?? ""}
            onChangeText={(t) => props.onChangeScripture(toNull(t))}
            placeholder="본문 (예: 요 3:16)"
            placeholderTextColor={colors.ink3}
            accessibilityLabel="생명양식 본문"
            maxLength={40}
            autoCapitalize="none"
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => focusNext("scripture")}
          />
          {scriptureValid && (
            <Text style={[styles.check, { color: colors.accent }]}>✓</Text>
          )}
          <Pressable
            onPress={() => setPreviewOpen(true)}
            disabled={!scriptureValid}
            accessibilityRole="button"
            accessibilityLabel="본문 보기"
            hitSlop={8}
            style={styles.bookBtn}
          >
            <Text
              style={{
                opacity: scriptureValid ? 1 : 0.3,
                fontSize: 18,
              }}
            >
              📖
            </Text>
          </Pressable>
        </View>
      </View>

      <DatePickerModal
        visible={dateOpen}
        value={props.sermonDate}
        onSelect={handlePickDate}
        onClose={() => setDateOpen(false)}
      />
      <ScripturePreviewModal
        visible={previewOpen}
        scripture={props.scripture}
        onClose={() => setPreviewOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 44,
    gap: 12,
  },
  lastRow: {},
  label: { width: 64, fontWeight: "600" },
  input: { flex: 1, paddingVertical: 8 },
  dateField: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dateBtn: {
    width: 40,
    height: 36,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  scriptureField: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  scriptureInput: { flex: 1 },
  check: { fontSize: 16, fontWeight: "700" },
  bookBtn: {
    minWidth: 32,
    minHeight: 32,
    alignItems: "center",
    justifyContent: "center",
  },
});
