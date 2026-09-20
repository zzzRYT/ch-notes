import React from "react";
import { Pressable, Text, View } from "react-native";

type Props = {
  side: "left" | "right";
  label: string;
  glyph: string;
  onExpand: () => void;
};

export function PanelRail({ side, label, glyph, onExpand }: Props) {
  return (
    <Pressable
      onPress={onExpand}
      accessibilityRole="button"
      accessibilityLabel={`${label} 펼치기`}
      className={`w-[38px] py-4 items-center justify-start gap-[18px] bg-bg border-rule ${
        side === "right" ? "border-l-hairline" : "border-r-hairline"
      }`}
    >
      {/* 글리프·화살표는 아이콘(icon/glyph) — fontScale을 타지 않는다 */}
      <Text className="text-[16px] font-semibold text-accent">{glyph}</Text>
      <View className="items-center">
        {label.split("").map((ch, i) => (
          <Text
            key={`${ch}-${i}`}
            className="text-caption font-semibold leading-[14px] text-ink-2"
          >
            {ch}
          </Text>
        ))}
      </View>
      <Text className="text-[14px] mt-auto text-ink-3">
        {side === "left" ? "›" : "‹"}
      </Text>
    </Pressable>
  );
}
