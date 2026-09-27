import React from "react";
import { View } from "react-native";

// 본문 자리를 채우는 회색 줄들. 노트를 불러오거나 웹 에디터가 뜨는 동안 빈 화면
// 대신 보여, 내용이 들어올 때 화면이 번쩍이지 않게 한다.
const BODY = ["92%", "100%", "84%", "96%", "60%"] as const;
const META = ["70%", "40%", "50%", "45%"] as const;

function Bars({ widths, height }: { widths: readonly string[]; height: number }) {
  return widths.map((w, i) => (
    <View
      key={i}
      className="rounded-8 bg-chip-bg"
      style={{ width: w as `${number}%`, height }}
    />
  ));
}

/** `withMeta`면 설교 정보 머리까지 그린다(노트를 불러오는 중). */
export function EditorSkeleton({ withMeta = false }: { withMeta?: boolean }) {
  return (
    <View accessibilityLabel="노트를 불러오는 중" className="px-5 pt-3 gap-3.5">
      {withMeta && (
        <View className="gap-4 pb-5 mb-2 border-b border-rule">
          <Bars widths={META} height={22} />
        </View>
      )}
      <Bars widths={BODY} height={16} />
    </View>
  );
}
