import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
  StyleSheet,
} from "react-native";
import type { BlockNode, Verse } from "@/domain/types";
import { useTheme, scaled, type Theme } from "@/theme/ThemeProvider";
import { formatRef } from "@/parser/format-ref";

type Props = Extract<BlockNode, { type: "quote" }>;

export function QuoteBlock(props: Props) {
  const theme = useTheme();
  const refLabel = formatRef(props.ref);
  switch (theme.blockStyle) {
    case "quote":
      return <QuoteVariant {...props} theme={theme} refLabel={refLabel} />;
    case "collapse":
      return <CollapseVariant {...props} theme={theme} refLabel={refLabel} />;
    case "card":
    default:
      return <CardVariant {...props} theme={theme} refLabel={refLabel} />;
  }
}

type VariantProps = Props & { theme: Theme; refLabel: string };

function HeaderLabel({
  refLabel,
  theme,
  prefixDot = true,
}: {
  refLabel: string;
  theme: Theme;
  prefixDot?: boolean;
}) {
  const { colors, fontScale } = theme;
  return (
    <View style={styles.head}>
      {prefixDot && (
        <View style={[styles.dot, { backgroundColor: colors.accent }]} />
      )}
      <Text
        style={[
          styles.label,
          {
            color: colors.accent,
            fontSize: scaled(12, fontScale),
          },
        ]}
      >
        {refLabel}
      </Text>
    </View>
  );
}

function Body({
  verses,
  status,
  theme,
}: {
  verses: Verse[];
  status: Props["status"];
  theme: Theme;
}) {
  const { colors, fontScale, fontStack } = theme;
  if (status === "loading") {
    return (
      <View style={styles.loadingRow}>
        <ActivityIndicator size="small" color={colors.ink3} />
        <Text style={{ color: colors.ink3 }}>불러오는 중…</Text>
      </View>
    );
  }
  if (status === "error") {
    return (
      <Text style={{ color: colors.errText }}>본문을 찾을 수 없습니다</Text>
    );
  }
  return (
    <>
      {verses.map((v) => (
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
                fontFamily: fontStack,
                fontSize: scaled(15, fontScale),
                lineHeight: scaled(24, fontScale),
              },
            ]}
          >
            {v.text}
          </Text>
        </View>
      ))}
    </>
  );
}

function CardVariant({ verses, status, theme, refLabel }: VariantProps) {
  const { colors } = theme;
  const borderColor = status === "error" ? colors.errBar : colors.rule;
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.paper, borderColor },
      ]}
      accessibilityRole="text"
      accessibilityLabel={`인용 ${refLabel}`}
    >
      <HeaderLabel refLabel={refLabel} theme={theme} />
      <Body verses={verses} status={status} theme={theme} />
    </View>
  );
}

function QuoteVariant({ verses, status, theme, refLabel }: VariantProps) {
  const { colors } = theme;
  return (
    <View
      style={[styles.quoteWrap, { backgroundColor: colors.accentSoft }]}
      accessibilityRole="text"
      accessibilityLabel={`인용 ${refLabel}`}
    >
      <View style={[styles.quoteBar, { backgroundColor: colors.accent }]} />
      <View style={styles.quoteBody}>
        <HeaderLabel refLabel={refLabel} theme={theme} prefixDot={false} />
        <Body verses={verses} status={status} theme={theme} />
      </View>
    </View>
  );
}

function CollapseVariant({ verses, status, theme, refLabel }: VariantProps) {
  const [open, setOpen] = useState(true);
  const { colors, fontScale } = theme;
  return (
    <View
      style={[
        styles.collapse,
        { borderColor: colors.rule, backgroundColor: colors.bg },
      ]}
      accessibilityRole="text"
      accessibilityLabel={`인용 ${refLabel}`}
    >
      <Pressable
        onPress={() => setOpen((v) => !v)}
        accessibilityRole="button"
        accessibilityLabel={`${refLabel} ${open ? "접기" : "펼치기"}`}
        accessibilityState={{ expanded: open }}
        style={styles.collapseHead}
      >
        <Text
          style={[
            styles.collapseChev,
            { color: colors.accent, fontSize: scaled(11, fontScale) },
          ]}
        >
          {open ? "▾" : "▸"}
        </Text>
        <Text
          style={[
            styles.label,
            {
              color: colors.accent,
              fontSize: scaled(12, fontScale),
            },
          ]}
        >
          {refLabel}
        </Text>
      </Pressable>
      {open && (
        <View style={styles.collapseBody}>
          <Body verses={verses} status={status} theme={theme} />
        </View>
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
  quoteWrap: {
    flexDirection: "row",
    marginVertical: 10,
    borderRadius: 8,
    overflow: "hidden",
  },
  quoteBar: { width: 3 },
  quoteBody: { flex: 1, paddingHorizontal: 14, paddingVertical: 12 },
  collapse: {
    marginVertical: 8,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  collapseHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 36,
  },
  collapseChev: { fontWeight: "600", width: 12, textAlign: "center" },
  collapseBody: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 4,
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
