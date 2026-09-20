import React, { useEffect, useRef, useState, type RefObject } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Calendar } from "lucide-react-native";
import { validateScripture } from "@/features/scripture/insert";
import { useTheme, scaled } from "@/shared/ui";
import { parseFlexibleDate, todayYmd } from "../lib/calendar";
import { nextMetaField, type MetaFieldKey } from "../lib/field-nav";
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
  // lucide 아이콘 색·크기만 prop으로 받는다.
  const { colors, fontScale } = useTheme();
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

  return (
    <View className="px-6 pt-3 pb-2 border-b-hairline border-rule gap-0.5">
      <View className={ROW}>
        <Text className={LABEL}>제목</Text>
        <TextInput
          ref={titleRef}
          className={`${INPUT} font-bold text-title`}
          value={props.title ?? ""}
          onChangeText={(t) => props.onChangeTitle(toNull(t))}
          placeholder="설교 제목"
          placeholderTextColorClassName="text-ink-3"
          accessibilityLabel="설교 제목"
          maxLength={120}
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => focusNext("title")}
        />
      </View>

      <View className={ROW}>
        <Text className={LABEL}>날짜</Text>
        <View className={FIELD_GROUP}>
          <TextInput
            ref={dateRef}
            className={`${INPUT} text-body`}
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
            placeholderTextColorClassName="text-ink-3"
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
            className="w-10 h-9 rounded-8 border-hairline border-rule items-center justify-center bg-accent-soft active:opacity-60"
          >
            <Calendar
              size={scaled(18, fontScale)}
              color={colors.accent}
              strokeWidth={2}
            />
          </Pressable>
        </View>
      </View>

      <View className={ROW}>
        <Text className={LABEL}>설교자</Text>
        <TextInput
          ref={preacherRef}
          className={`${INPUT} text-body`}
          value={props.preacher ?? ""}
          onChangeText={(t) => props.onChangePreacher(toNull(t))}
          placeholder="설교자 이름"
          placeholderTextColorClassName="text-ink-3"
          accessibilityLabel="설교자"
          maxLength={60}
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => focusNext("preacher")}
        />
      </View>

      <View className={ROW}>
        <Text className={LABEL}>장소</Text>
        <TextInput
          ref={locationRef}
          className={`${INPUT} text-body`}
          value={props.location ?? ""}
          onChangeText={(t) => props.onChangeLocation(toNull(t))}
          placeholder="예배 장소"
          placeholderTextColorClassName="text-ink-3"
          accessibilityLabel="장소"
          maxLength={60}
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => focusNext("location")}
        />
      </View>

      <View className={ROW}>
        <Text className={LABEL}>생명양식</Text>
        <View className={FIELD_GROUP}>
          <TextInput
            ref={scriptureRef}
            className={`${INPUT} text-body`}
            value={props.scripture ?? ""}
            onChangeText={(t) => props.onChangeScripture(toNull(t))}
            placeholder="본문 (예: 요 3:16)"
            placeholderTextColorClassName="text-ink-3"
            accessibilityLabel="생명양식 본문"
            maxLength={40}
            autoCapitalize="none"
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => focusNext("scripture")}
          />
          {scriptureValid && (
            <Text className="text-[16px] font-bold text-accent">✓</Text>
          )}
          <Pressable
            onPress={() => setPreviewOpen(true)}
            disabled={!scriptureValid}
            accessibilityRole="button"
            accessibilityLabel="본문 보기"
            hitSlop={8}
            className="min-w-8 min-h-8 items-center justify-center"
          >
            <Text
              className={`text-[18px] ${scriptureValid ? "opacity-100" : "opacity-30"}`}
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

const ROW = "flex-row items-center min-h-touch gap-3";
const LABEL = "w-16 font-semibold text-ink-3 text-label";
const INPUT = "flex-1 py-2 text-ink font-body";
const FIELD_GROUP = "flex-1 flex-row items-center gap-1.5";
