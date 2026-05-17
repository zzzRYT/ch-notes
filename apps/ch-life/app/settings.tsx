import React, { useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { pickAndImport, type ConflictPolicy } from "@/share/import-note";
import type { Note } from "@/domain/types";

function promptPolicy(existing: Note): Promise<ConflictPolicy> {
  return new Promise((resolve) => {
    const label = existing.title ?? existing.id;
    Alert.alert(
      "이미 존재하는 노트",
      `"${label}" 와 동일한 id의 노트가 있습니다.`,
      [
        { text: "건너뛰기", style: "cancel", onPress: () => resolve("skip") },
        { text: "새 id로 추가", onPress: () => resolve("new-id") },
        { text: "덮어쓰기", style: "destructive", onPress: () => resolve("overwrite") },
      ],
    );
  });
}

export default function Settings() {
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

  return (
    <View style={styles.root}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 16 },
  section: { gap: 12, marginBottom: 24 },
  sectionTitle: { fontSize: 14, color: "#888", textTransform: "uppercase" },
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
  msg: { color: "#222", fontSize: 14, paddingTop: 8 },
});
