import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useTheme, scaled } from "@/theme/ThemeProvider";
import { formatKoreanDate } from "./calendar";
import { validateScripture } from "./scripture-field";
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
};

function toNull(v: string): string | null {
  return v.length === 0 ? null : v;
}

export function SermonMetaHeader(props: SermonMetaHeaderProps) {
  const { colors, fontScale, fontStack } = useTheme();
  const [dateOpen, setDateOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

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
        />
      </View>

      <View style={styles.row}>
        <Text style={labelStyle}>날짜</Text>
        <Pressable
          onPress={() => setDateOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="설교 날짜 선택"
          style={styles.pressField}
        >
          <Text style={[fieldText, !props.sermonDate && { color: colors.ink3 }]}>
            {props.sermonDate ? formatKoreanDate(props.sermonDate) : "날짜 선택"}
          </Text>
          <Text style={[styles.chev, { color: colors.ink3 }]}>▾</Text>
        </Pressable>
      </View>

      <View style={styles.row}>
        <Text style={labelStyle}>설교자</Text>
        <TextInput
          style={[styles.input, fieldText]}
          value={props.preacher ?? ""}
          onChangeText={(t) => props.onChangePreacher(toNull(t))}
          placeholder="설교자 이름"
          placeholderTextColor={colors.ink3}
          accessibilityLabel="설교자"
          maxLength={60}
        />
      </View>

      <View style={styles.row}>
        <Text style={labelStyle}>장소</Text>
        <TextInput
          style={[styles.input, fieldText]}
          value={props.location ?? ""}
          onChangeText={(t) => props.onChangeLocation(toNull(t))}
          placeholder="예배 장소"
          placeholderTextColor={colors.ink3}
          accessibilityLabel="장소"
          maxLength={60}
        />
      </View>

      <View style={[styles.row, styles.lastRow]}>
        <Text style={labelStyle}>생명양식</Text>
        <View style={styles.scriptureField}>
          <TextInput
            style={[styles.input, styles.scriptureInput, fieldText]}
            value={props.scripture ?? ""}
            onChangeText={(t) => props.onChangeScripture(toNull(t))}
            placeholder="본문 (예: 요 3:16)"
            placeholderTextColor={colors.ink3}
            accessibilityLabel="생명양식 본문"
            maxLength={40}
            autoCapitalize="none"
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
        onSelect={props.onChangeSermonDate}
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
  pressField: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  chev: { fontSize: 12 },
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
