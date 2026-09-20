import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { BibleReader, useBiblePosition } from "@/widgets/scripture-browser";
import { BibleLookupPanel } from "./BibleLookupPanel";

type Tab = "reader" | "cited";

type Props = {
  citedRefs: ReadonlyArray<string>;
  onInsert: (ref: string) => void;
  onCollapse: () => void;
};

export function BiblePanel({ citedRefs, onInsert, onCollapse }: Props) {
  const [tab, setTab] = useState<Tab>("reader");
  const { initialRef, onPositionChange } = useBiblePosition();

  return (
    <View className="flex-1 bg-paper">
      <View className="flex-row items-center border-b-hairline border-rule px-2">
        <TabBtn
          label="성경"
          active={tab === "reader"}
          onPress={() => setTab("reader")}
        />
        <TabBtn
          label="인용"
          badge={citedRefs.length}
          active={tab === "cited"}
          onPress={() => setTab("cited")}
        />
        <View className="flex-1" />
        <Pressable
          onPress={onCollapse}
          accessibilityRole="button"
          accessibilityLabel="성경 패널 접기"
          hitSlop={10}
          className="size-7 items-center justify-center rounded-6"
        >
          <Text className="text-[18px] text-ink-2">›</Text>
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
}: {
  label: string;
  active: boolean;
  badge?: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
      className={`flex-row items-center gap-1.5 px-3 py-3.5 min-h-12 border-b-2 ${
        active ? "border-accent" : "border-transparent"
      }`}
    >
      <Text
        className={`text-body ${active ? "text-ink font-semibold" : "text-ink-3"}`}
      >
        {label}
      </Text>
      {badge != null && badge > 0 && (
        <View className="px-[7px] py-0.5 rounded-full bg-chip-bg">
          <Text className="text-caption font-semibold text-ink-3">{badge}</Text>
        </View>
      )}
    </Pressable>
  );
}
