import React, { useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Constants from "expo-constants";
import { useAppStore } from "@/state/app-store";
import { pickAndImport, type ConflictPolicy } from "@/share/import-note";
import { useTheme } from "@/theme/ThemeProvider";
import type { Note, Settings } from "@/domain/types";

function promptPolicy(existing: Note): Promise<ConflictPolicy> {
  return new Promise((resolve) => {
    const label = existing.title ?? existing.id;
    Alert.alert(
      "이미 존재하는 노트",
      `"${label}" 와 동일한 id의 노트가 있습니다.`,
      [
        { text: "건너뛰기", style: "cancel", onPress: () => resolve("skip") },
        { text: "새 id로 추가", onPress: () => resolve("new-id") },
        {
          text: "덮어쓰기",
          style: "destructive",
          onPress: () => resolve("overwrite"),
        },
      ],
    );
  });
}

const FONT_OPTIONS: ReadonlyArray<{
  label: string;
  value: Settings["fontScale"];
}> = [
  { label: "보통", value: 1.0 },
  { label: "크게", value: 1.2 },
  { label: "더 크게", value: 1.4 },
  { label: "아주 크게", value: 1.6 },
];

const THEME_OPTIONS: ReadonlyArray<{
  label: string;
  value: Settings["themePreference"];
}> = [
  { label: "시스템", value: "system" },
  { label: "라이트", value: "light" },
  { label: "다크", value: "dark" },
];

export default function SettingsScreen() {
  const { colors } = useTheme();
  const settings = useAppStore((s) => s.settings);
  const setSettings = useAppStore((s) => s.setSettings);
  const [busy, setBusy] = useState(false);
  const [lastMsg, setLastMsg] = useState<string | null>(null);

  const handleImport = async () => {
    if (busy) return;
    setBusy(true);
    setLastMsg(null);
    try {
      const r = await pickAndImport(promptPolicy);
      setLastMsg(
        r.imported > 0
          ? `${r.imported}개 가져옴`
          : r.skipped > 0
            ? "건너뜀"
            : "취소됨",
      );
    } catch (e) {
      console.warn("import failed", e);
      setLastMsg("가져오기 실패");
    } finally {
      setBusy(false);
    }
  };

  const version =
    Constants.expoConfig?.version ?? Constants.manifest2?.extra?.version ?? "?";

  const renderChip = (
    label: string,
    selected: boolean,
    onPress: () => void,
  ) => (
    <Pressable
      key={label}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      style={[
        styles.chip,
        { backgroundColor: selected ? colors.accent : colors.chipBg },
      ]}
    >
      <Text
        style={[
          styles.chipText,
          {
            color: selected ? colors.accentText : colors.chipText,
            fontWeight: selected ? "600" : "400",
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.subtle }]}>
          글꼴 크기
        </Text>
        <View style={styles.row}>
          {FONT_OPTIONS.map((o) =>
            renderChip(o.label, settings.fontScale === o.value, () =>
              setSettings({ fontScale: o.value }),
            ),
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.subtle }]}>테마</Text>
        <View style={styles.row}>
          {THEME_OPTIONS.map((o) =>
            renderChip(o.label, settings.themePreference === o.value, () =>
              setSettings({ themePreference: o.value }),
            ),
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.subtle }]}>
          가져오기 / 내보내기
        </Text>
        <Pressable
          style={[
            styles.btn,
            { backgroundColor: colors.accent },
            busy && styles.btnBusy,
          ]}
          onPress={handleImport}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel="마크다운 노트 가져오기"
        >
          <Text style={[styles.btnText, { color: colors.accentText }]}>
            {busy ? "가져오는 중…" : "마크다운 파일 가져오기"}
          </Text>
        </Pressable>
        <Text style={[styles.hint, { color: colors.subtle }]}>
          내보내기는 노트 화면 오른쪽 위의 📤 버튼을 사용하세요.
        </Text>
        {lastMsg && <Text style={{ color: colors.text }}>{lastMsg}</Text>}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.subtle }]}>정보</Text>
        <Text style={{ color: colors.text }}>버전 {version}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 16, gap: 8 },
  section: { gap: 12, marginBottom: 20 },
  sectionTitle: { fontSize: 12, textTransform: "uppercase" },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    minHeight: 40,
    justifyContent: "center",
  },
  chipText: { fontSize: 14 },
  btn: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    minHeight: 48,
    justifyContent: "center",
  },
  btnBusy: { opacity: 0.5 },
  btnText: { fontSize: 16 },
  hint: { fontSize: 13 },
});
