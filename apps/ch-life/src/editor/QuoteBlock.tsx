import React from "react";
import { ActivityIndicator, Text, View, StyleSheet } from "react-native";
import type { BlockNode } from "@/domain/types";
import { useTheme, scaled } from "@/theme/ThemeProvider";

type Props = Extract<BlockNode, { type: "quote" }>;

export function QuoteBlock({ ref, verses, status }: Props) {
  const { colors, fontScale } = useTheme();
  const borderColor = status === "error" ? colors.errBar : colors.rule;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.paper, borderColor },
      ]}
      accessibilityRole="text"
      accessibilityLabel={`인용 ${ref}`}
    >
      <View style={styles.head}>
        <View style={[styles.dot, { backgroundColor: colors.accent }]} />
        <Text
          style={[
            styles.label,
            {
              color: colors.accent,
              fontSize: scaled(12, fontScale),
            },
          ]}
        >
          {ref}
        </Text>
      </View>
      {status === "loading" && (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={colors.ink3} />
          <Text style={{ color: colors.ink3 }}>불러오는 중…</Text>
        </View>
      )}
      {status === "loaded" &&
        verses.map((v) => (
          <View
            key={`${v.book}-${v.chapter}-${v.verse}`}
            style={styles.verseRow}
          >
            <Text
              style={[
                styles.verseNum,
                {
                  color: colors.ink3,
                  fontSize: scaled(11, fontScale),
                  lineHeight: scaled(20, fontScale),
                },
              ]}
            >
              {v.verse}
            </Text>
            <Text
              style={[
                styles.verseText,
                {
                  color: colors.ink,
                  fontSize: scaled(15, fontScale),
                  lineHeight: scaled(24, fontScale),
                },
              ]}
            >
              {v.text}
            </Text>
          </View>
        ))}
      {status === "error" && (
        <Text style={{ color: colors.errText }}>본문을 찾을 수 없습니다</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginVertical: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    padding: 14,
  },
  head: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontWeight: "600",
    letterSpacing: 0,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  verseRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 2,
  },
  verseNum: {
    minWidth: 16,
    paddingTop: 2,
    fontWeight: "600",
    textAlign: "left",
  },
  verseText: { flex: 1 },
});
