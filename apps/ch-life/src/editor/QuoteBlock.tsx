import React from "react";
import { ActivityIndicator, Text, View, StyleSheet } from "react-native";
import type { BlockNode } from "@/domain/types";

type Props = Extract<BlockNode, { type: "quote" }>;

export function QuoteBlock({ ref, verses, status }: Props) {
  const barColor = status === "error" ? "#c8342a" : "#bdbdbd";
  return (
    <View
      style={[styles.row, { borderLeftColor: barColor }]}
      accessibilityRole="text"
      accessibilityLabel={`인용 ${ref}`}
    >
      <View style={styles.body}>
        <Text style={styles.ref}>{ref}</Text>
        {status === "loading" && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" />
            <Text style={styles.loading}>불러오는 중…</Text>
          </View>
        )}
        {status === "loaded" &&
          verses.map((v) => (
            <Text
              key={`${v.book}-${v.chapter}-${v.verse}`}
              style={styles.verse}
            >
              {v.text}
            </Text>
          ))}
        {status === "error" && (
          <Text style={styles.error}>본문을 찾을 수 없습니다</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    paddingLeft: 12,
    borderLeftWidth: 4,
    marginVertical: 8,
  },
  body: { flex: 1 },
  ref: { fontWeight: "600", marginBottom: 4, fontSize: 16 },
  loadingRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  loading: { color: "#7a7a7a" },
  verse: { fontSize: 16, lineHeight: 24 },
  error: { color: "#c8342a" },
});
