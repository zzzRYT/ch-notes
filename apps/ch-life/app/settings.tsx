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

  return (
    <View style={styles.root}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>글꼴 크기</Text>
        <View style={styles.row}>
          {FONT_OPTIONS.map((o) => (
            <Pressable
              key={o.value}
              onPress={() => setSettings({ fontScale: o.value })}
              accessibilityRole="button"
              accessibilityState={{ selected: settings.fontScale === o.value }}
              accessibilityLabel={o.label}
              style={[
                styles.chip,
                settings.fontScale === o.value && styles.chipActive,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  settings.fontScale === o.value && styles.chipTextActive,
                ]}
              >
                {o.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>테마</Text>
        <View style={styles.row}>
          {THEME_OPTIONS.map((o) => (
            <Pressable
              key={o.value}
              onPress={() => setSettings({ themePreference: o.value })}
              accessibilityRole="button"
              accessibilityState={{
                selected: settings.themePreference === o.value,
              }}
              accessibilityLabel={o.label}
              style={[
                styles.chip,
                settings.themePreference === o.value && styles.chipActive,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  settings.themePreference === o.value && styles.chipTextActive,
                ]}
              >
                {o.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>가져오기 / 내보내기</Text>
        <Pressable
          style={[styles.btn, busy && styles.btnBusy]}
          onPress={handleImport}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel="마크다운 노트 가져오기"
        >
          <Text style={styles.btnText}>
            {busy ? "가져오는 중…" : "마크다운 파일 가져오기"}
          </Text>
        </Pressable>
        <Text style={styles.hint}>
          내보내기는 노트 화면 오른쪽 위의 📤 버튼을 사용하세요.
        </Text>
        {lastMsg && <Text style={styles.msg}>{lastMsg}</Text>}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>정보</Text>
        <Text style={styles.info}>버전 {version}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 16, gap: 8 },
  section: { gap: 12, marginBottom: 20 },
  sectionTitle: { fontSize: 12, color: "#888", textTransform: "uppercase" },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#f0f0f0",
    minHeight: 40,
    justifyContent: "center",
  },
  chipActive: { backgroundColor: "#222" },
  chipText: { color: "#444", fontSize: 14 },
  chipTextActive: { color: "white", fontWeight: "600" },
  btn: {
    backgroundColor: "#222",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    minHeight: 48,
    justifyContent: "center",
  },
  btnBusy: { opacity: 0.5 },
  btnText: { color: "white", fontSize: 16 },
  hint: { color: "#666", fontSize: 13 },
  msg: { color: "#222", fontSize: 14 },
  info: { color: "#444", fontSize: 14 },
});
