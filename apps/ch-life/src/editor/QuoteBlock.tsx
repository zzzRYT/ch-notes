import React from "react";
import { ActivityIndicator, Text, View, StyleSheet } from "react-native";
import type { BlockNode } from "@/domain/types";
import { useTheme, scaled } from "@/theme/ThemeProvider";

type Props = Extract<BlockNode, { type: "quote" }>;

export function QuoteBlock({ ref, verses, status }: Props) {
  const { colors, fontScale } = useTheme();
  const barColor = status === "error" ? colors.errBar : colors.quoteBar;
  return (
    <View
      style={[styles.row, { borderLeftColor: barColor }]}
      accessibilityRole="text"
      accessibilityLabel={`인용 ${ref}`}
    >
      <View style={styles.body}>
        <Text
          style={[
            styles.ref,
            { color: colors.text, fontSize: scaled(16, fontScale) },
          ]}
        >
          {ref}
        </Text>
        {status === "loading" && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={colors.subtle} />
            <Text style={{ color: colors.subtle }}>불러오는 중…</Text>
          </View>
        )}
        {status === "loaded" &&
          verses.map((v) => (
            <Text
              key={`${v.book}-${v.chapter}-${v.verse}`}
              style={{
                color: colors.text,
                fontSize: scaled(16, fontScale),
                lineHeight: scaled(24, fontScale),
              }}
            >
              {v.text}
            </Text>
          ))}
        {status === "error" && (
          <Text style={{ color: colors.errText }}>본문을 찾을 수 없습니다</Text>
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
  ref: { fontWeight: "600", marginBottom: 4 },
  loadingRow: { flexDirection: "row", alignItems: "center", gap: 8 },
});
