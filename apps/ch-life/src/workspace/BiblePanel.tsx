import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { BibleReader } from "@/browser/BibleReader";
import { useBiblePosition } from "@/browser/useBiblePosition";
import { BibleLookupPanel } from "./BibleLookupPanel";

type Tab = "reader" | "cited";

type Props = {
  citedRefs: ReadonlyArray<string>;
  onInsert: (ref: string) => void;
  onCollapse: () => void;
};

export function BiblePanel({ citedRefs, onInsert, onCollapse }: Props) {
  const { colors } = useTheme();
  const [tab, setTab] = useState<Tab>("reader");
  const { initialRef, onPositionChange } = useBiblePosition();

  return (
    <View style={[styles.root, { backgroundColor: colors.paper }]}>
      <View style={[styles.tabs, { borderBottomColor: colors.rule }]}>
        <TabBtn
          label="성경"
          active={tab === "reader"}
          onPress={() => setTab("reader")}
          colors={colors}
        />
        <TabBtn
          label="인용"
          badge={citedRefs.length}
          active={tab === "cited"}
          onPress={() => setTab("cited")}
          colors={colors}
        />
        <View style={styles.spacer} />
        <Pressable
          onPress={onCollapse}
          accessibilityRole="button"
          accessibilityLabel="성경 패널 접기"
          hitSlop={10}
          style={styles.collapseBtn}
        >
          <Text style={[styles.collapseText, { color: colors.ink2 }]}>›</Text>
        </Pressable>
      </View>

      {tab === "reader" ? (
        <BibleReader
          onInsertVerse={onInsert}
          insertMode="currentNote"
          initialRef={initialRef}
          onPositionChange={onPositionChange}
        />
      ) : (
        <BibleLookupPanel
          citedRefs={citedRefs}
          onInsert={onInsert}
          onCollapse={onCollapse}
          hideHeader
        />
      )}
    </View>
  );
}

function TabBtn({
  label,
  active,
  badge,
  onPress,
  colors,
}: {
  label: string;
  active: boolean;
  badge?: number;
  onPress: () => void;
  colors: ReturnType<typeof useTheme>["colors"];
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
      style={[
        styles.tabBtn,
        active && { borderBottomColor: colors.accent },
      ]}
    >
      <Text
        style={[
          styles.tabLabel,
          { color: active ? colors.ink : colors.ink3 },
          active && styles.tabLabelActive,
        ]}
      >
        {label}
      </Text>
      {badge != null && badge > 0 && (
        <View style={[styles.badge, { backgroundColor: colors.chipBg }]}>
          <Text style={[styles.badgeText, { color: colors.ink3 }]}>{badge}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  tabs: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 8,
  },
  spacer: { flex: 1 },
  tabBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 14,
    minHeight: 48,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabLabel: { fontSize: 15 },
  tabLabelActive: { fontWeight: "600" },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
  },
  badgeText: { fontSize: 10, fontWeight: "600" },
  collapseBtn: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
  },
  collapseText: { fontSize: 18 },
});
