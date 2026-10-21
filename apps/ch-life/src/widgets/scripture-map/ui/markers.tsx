import React from "react";
import { Pressable, Text, View } from "react-native";
import Svg, { Circle, Path, Rect } from "react-native-svg";
import { useTheme } from "@/shared/ui";

/** 시대는 색이 아니라 모양으로 구분한다(R5): 여호수아 ◆ · 왕국 ■ · 예수님 사역 ●. */
export type Glyph = "diamond" | "square" | "circle";

export function PeriodGlyph({
  glyph,
  size = 10,
  filled = true,
}: {
  glyph: Glyph;
  size?: number;
  filled?: boolean;
}) {
  const { colors } = useTheme();
  const s = size;
  const h = s / 2;
  const sw = 1.4;
  const fill = filled ? colors.ink : "none";
  return (
    <Svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
      {glyph === "diamond" ? (
        <Path
          d={`M${h} ${sw / 2}L${s - sw / 2} ${h}L${h} ${s - sw / 2}L${sw / 2} ${h}Z`}
          fill={fill}
          stroke={colors.ink}
          strokeWidth={sw}
          strokeLinejoin="round"
        />
      ) : glyph === "square" ? (
        <Rect
          x={sw / 2 + 0.5}
          y={sw / 2 + 0.5}
          width={s - sw - 1}
          height={s - sw - 1}
          rx={1.5}
          fill={fill}
          stroke={colors.ink}
          strokeWidth={sw}
        />
      ) : (
        <Circle cx={h} cy={h} r={h - sw / 2} fill={fill} stroke={colors.ink} strokeWidth={sw} />
      )}
    </Svg>
  );
}

const TARGET = 44;

/** 표식 자리(44pt 터치 영역)와 라벨 칩 배치. 라벨은 표식 옆에 놓이고 터치를 받지 않는다. */
function MarkerFrame({
  x,
  y,
  side,
  selected,
  accessibilityLabel,
  onPress,
  children,
  chip,
  column,
}: {
  x: number;
  y: number;
  side: "left" | "right";
  selected: boolean;
  accessibilityLabel: string;
  onPress: () => void;
  children: React.ReactNode;
  chip: React.ReactNode;
  /** 라벨 칩을 두 줄로 쌓는다(이름 아래 보조 글자). */
  column?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected }}
      style={{
        position: "absolute",
        left: x - TARGET / 2,
        top: y - TARGET / 2,
        width: TARGET,
        height: TARGET,
        alignItems: "center",
        justifyContent: "center",
        zIndex: selected ? 2 : 1,
      }}
    >
      {selected ? (
        <View
          style={{
            position: "absolute",
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.accentSoft,
            borderWidth: 1,
            borderColor: colors.accent,
          }}
        />
      ) : null}
      {children}
      {/* 폭을 고정해 둔 바깥 상자 — 절대 배치된 텍스트가 좁게 접히지 않게 한다. */}
      <View
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          width: 240,
          justifyContent: "center",
          alignItems: side === "right" ? "flex-start" : "flex-end",
          ...(side === "right" ? { left: 38 } : { right: 38 }),
        }}
      >
        <View
          style={{
            flexDirection: column ? "column" : "row",
            alignItems: column ? "flex-start" : "baseline",
            gap: column ? 0 : 4,
            paddingHorizontal: 7,
            paddingVertical: column ? 3 : 5,
            borderRadius: 8,
            backgroundColor: colors.paper,
            borderWidth: 1,
            borderColor: selected ? colors.ink : colors.ink4,
          }}
        >
          {chip}
        </View>
      </View>
    </Pressable>
  );
}

export type RegionMarkerProps = {
  x: number;
  y: number;
  side: "left" | "right";
  name: string;
  noteCount: number;
  periodCount: number;
  selected: boolean;
  onPress: () => void;
};

/** 전체 지도의 지역 묶음 표식. 여러 시대면 이중 윤곽과 `N시대`. */
export function RegionMarker({
  x,
  y,
  side,
  name,
  noteCount,
  periodCount,
  selected,
  onPress,
}: RegionMarkerProps) {
  const { colors } = useTheme();
  const multi = periodCount > 1;
  return (
    <MarkerFrame
      x={x}
      y={y}
      side={side}
      selected={selected}
      accessibilityLabel={`${name} ${multi ? `${periodCount}시대` : ""} ${noteCount}편`.replace(
        "  ",
        " ",
      )}
      onPress={onPress}
      chip={
        <>
          <Text style={{ fontSize: 13, fontWeight: "700", color: colors.ink }}>{name}</Text>
          <Text style={{ fontSize: 12, color: colors.ink2 }}>{noteCount}편</Text>
          {multi ? (
            <Text
              style={{
                fontSize: 10,
                fontWeight: "600",
                color: colors.ink2,
                paddingLeft: 4,
                borderLeftWidth: 1,
                borderLeftColor: colors.ink4,
              }}
            >
              {periodCount}시대
            </Text>
          ) : null}
        </>
      }
    >
      {multi ? (
        <View
          style={{
            position: "absolute",
            width: 24,
            height: 24,
            borderRadius: 12,
            borderWidth: 1.5,
            borderColor: colors.ink,
            backgroundColor: colors.paper,
          }}
        />
      ) : null}
      <View
        style={{
          width: 16,
          height: 16,
          borderRadius: 8,
          borderWidth: 2,
          borderColor: colors.ink,
          backgroundColor: selected ? colors.ink : colors.paper,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View
          style={{
            width: 5,
            height: 5,
            borderRadius: 2.5,
            backgroundColor: selected ? colors.paper : colors.ink,
          }}
        />
      </View>
    </MarkerFrame>
  );
}

export type PlaceMarkerProps = {
  x: number;
  y: number;
  side: "left" | "right";
  name: string;
  /** 칩의 보조 글자: 시대 이름, 여러 시대가 겹쳐 있으면 `N시대`. */
  caption: string;
  glyph: Glyph;
  /** 같은 좌표에 겹친 장소가 둘 이상. */
  stacked: boolean;
  selected: boolean;
  onPress: () => void;
};

/** 지역 지도의 시대별 장소 표식. 같은 좌표의 여러 시대는 겹친 카드 모양 하나. */
export function PlaceMarker({
  x,
  y,
  side,
  name,
  caption,
  glyph,
  stacked,
  selected,
  onPress,
}: PlaceMarkerProps) {
  const { colors } = useTheme();
  return (
    <MarkerFrame
      x={x}
      y={y}
      side={side}
      selected={selected}
      accessibilityLabel={`${name} ${caption}`}
      onPress={onPress}
      column
      chip={
        <>
          <Text numberOfLines={1} style={{ fontSize: 13, fontWeight: "700", color: colors.ink }}>
            {name}
          </Text>
          <Text numberOfLines={1} style={{ fontSize: 11, fontWeight: "600", color: colors.ink2 }}>
            {caption}
          </Text>
        </>
      }
    >
      {stacked ? (
        <View
          style={{
            position: "absolute",
            width: 18,
            height: 18,
            borderRadius: 4,
            borderWidth: 1.4,
            borderColor: colors.ink,
            backgroundColor: colors.paper,
            transform: [{ translateX: 4 }, { translateY: -4 }],
          }}
        />
      ) : null}
      <View style={{ padding: 2, borderRadius: 4, backgroundColor: colors.paper }}>
        <PeriodGlyph glyph={glyph} size={14} filled={selected} />
      </View>
    </MarkerFrame>
  );
}
