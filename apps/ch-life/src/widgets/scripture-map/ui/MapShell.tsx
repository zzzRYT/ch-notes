import React, { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Svg, { G, Path, Rect, Text as SvgText, Circle } from "react-native-svg";
import { Locate, Minus, Plus } from "lucide-react-native";
import { useTheme } from "@/shared/ui";
import { placeContextLabels, scaleBar, type Avoid } from "../model/labels";
import type { Projection } from "../model/projection";
import { TERRAIN } from "../model/terrain";
import type { PanZoom } from "./usePanZoom";

type Props = {
  height: number;
  pz: PanZoom;
  proj: Projection | null;
  /** 확대 한계 — 버튼 비활성 판정에 쓴다. */
  maxK: number;
  /** 강 두께(확대해도 거의 일정하게 보이도록 아래에서 보정한다). */
  river: number;
  /** 라벨을 비워 둘 기록 표식 영역. */
  avoid: Avoid[];
  onWidth: (w: number) => void;
  /** 손가락이 지도에 닿아 있는 동안 true. 부모가 페이지 스크롤을 잠그는 데 쓴다. */
  onTouching?: (touching: boolean) => void;
  /** 기록 표식 층. 지형 위에 같은 크기로 깔린다. */
  children: React.ReactNode;
  radius?: number;
};

/** 투영 좌표의 [lon, lat, …] 평탄 고리들을 SVG 경로로. */
function toPath(rings: number[][], proj: Projection, close: boolean) {
  return rings
    .map((flat) => {
      const pts: string[] = [];
      for (let i = 0; i < flat.length; i += 2) {
        const [x, y] = proj.project(flat[i]!, flat[i + 1]!);
        pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
      }
      return `M${pts.join("L")}${close ? "Z" : ""}`;
    })
    .join("");
}

/**
 * 번들 지형 + 이동·확대 제스처 + 확대/축소 버튼 + 축척 막대 + 맥락 라벨.
 * 지형·강·라벨 글자는 확대 배율을 곱해 그리되 선 굵기는 배율로 나눠 일정하게 두고,
 * 표식(children)은 위치만 옮기고 크기는 그대로다.
 */
export function MapShell({
  height,
  pz,
  proj,
  maxK,
  river,
  avoid,
  onWidth,
  onTouching,
  children,
  radius = 16,
}: Props) {
  const { colors } = useTheme();
  const { t, size } = pz;
  const { w, h } = size;

  const shapes = useMemo(
    () =>
      proj
        ? {
            land: toPath(TERRAIN.land, proj, true),
            lakes: TERRAIN.lakes.map((l) => toPath(l.rings, proj, true)),
            rivers: toPath(TERRAIN.rivers, proj, false),
          }
        : null,
    [proj],
  );
  const labels = useMemo(
    () => (proj ? placeContextLabels(proj, t, size, avoid) : []),
    [proj, t, size, avoid],
  );
  const bar = proj ? scaleBar(proj, t, size) : null;
  const moved = t.k > 1.01 || Math.abs(t.x) > 1 || Math.abs(t.y) > 1;
  const strokeW = 1 / t.k;
  const riverW = (river * Math.min(2.2, Math.sqrt(t.k))) / t.k;

  return (
    <View
      ref={pz.viewRef}
      {...pz.panHandlers}
      onLayout={(e) => onWidth(Math.round(e.nativeEvent.layout.width))}
      // 부모 스크롤이 제스처를 먼저 가져가기 전에, 터치가 닿는 순간 잠글 수 있게 raw 터치로 알린다.
      onTouchStart={() => onTouching?.(true)}
      onTouchEnd={(e) => e.nativeEvent.touches.length === 0 && onTouching?.(false)}
      onTouchCancel={() => onTouching?.(false)}
      className="mx-5.5 overflow-hidden border-hairline border-rule bg-paper"
      style={{ height, borderRadius: radius }}
    >
      {proj && shapes ? (
        <>
          {/* Svg 자체의 pointerEvents는 네이티브에서 먹지 않아 터치를 가로챈다 — View로 감싸 막는다. */}
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <Svg width={w} height={h}>
              <Rect width={w} height={h} fill={colors.chipBg} />
              <G transform={`translate(${t.x} ${t.y}) scale(${t.k})`}>
                <Path
                  d={shapes.land}
                  fill={colors.paper}
                  stroke={colors.ink4}
                  strokeWidth={strokeW}
                />
                {shapes.lakes.map((d, i) => (
                  <Path
                    key={i}
                    d={d}
                    fill={colors.chipBg}
                    stroke={colors.ink4}
                    strokeWidth={strokeW}
                  />
                ))}
                <Path
                  d={shapes.rivers}
                  fill="none"
                  stroke={colors.accent}
                  strokeOpacity={0.5}
                  strokeWidth={riverW}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </G>
              {labels.map((l) => {
                const marked = l.kind === "town" || l.kind === "mount";
                const tx = marked ? l.x + 7 : l.x;
                const ty = l.y + (marked ? 4 : 0);
                const style = {
                  fontSize: l.kind === "area" ? 12 : 11,
                  fontWeight: (l.kind === "area" ? "600" : "400") as "600" | "400",
                  letterSpacing: l.kind === "area" ? 3.8 : l.kind === "water" ? 0.7 : 0,
                };
                return (
                  <G key={`${l.kind}-${l.name}-${l.lon}`} opacity={l.kind === "area" ? 0.8 : 1}>
                    {l.kind === "town" ? (
                      <Circle
                        cx={l.x}
                        cy={l.y}
                        r={2.6}
                        fill={colors.paper}
                        stroke={colors.ink2}
                        strokeWidth={1.2}
                      />
                    ) : null}
                    {l.kind === "mount" ? (
                      <Path
                        d={`M${l.x - 4} ${l.y + 3}L${l.x} ${l.y - 3.5}L${l.x + 4} ${l.y + 3}Z`}
                        fill={colors.ink2}
                      />
                    ) : null}
                    {/* 배경색 윤곽을 먼저 깔아 지형 위에서도 읽히게 한다. */}
                    {[true, false].map((halo) => (
                      <SvgText
                        key={String(halo)}
                        x={tx}
                        y={ty}
                        textAnchor={marked ? "start" : l.anchor}
                        fill={halo ? colors.paper : colors.ink2}
                        stroke={halo ? colors.paper : undefined}
                        strokeWidth={halo ? 3 : undefined}
                        {...style}
                      >
                        {l.name}
                      </SvgText>
                    ))}
                  </G>
                );
              })}
              {bar ? (
                <>
                  <Path
                    d={`M14 ${h - 22}V${h - 18}H${14 + bar.px}V${h - 22}`}
                    fill="none"
                    stroke={colors.ink2}
                    strokeWidth={1}
                  />
                  <SvgText x={14 + bar.px + 6} y={h - 18} fontSize={11} fill={colors.ink2}>
                    {bar.km} km
                  </SvgText>
                </>
              ) : null}
            </Svg>
          </View>
          <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
            {/* 빈 지형의 탭(더블탭 확대)을 받는 바닥 층. 표식은 이 위에 놓여 먼저 받는다. */}
            <Pressable
              style={StyleSheet.absoluteFill}
              accessible={false}
              importantForAccessibility="no"
              onPress={(e) => pz.onTap(e.nativeEvent.locationX, e.nativeEvent.locationY)}
            />
            {children}
          </View>
          <View className="absolute right-2.5 bottom-2.5 gap-2 items-end">
            <View className="rounded-10 overflow-hidden border-hairline border-rule bg-paper">
              <CtlButton label="확대" disabled={t.k >= maxK - 0.01} onPress={() => pz.zoomBy(1.6)}>
                <Plus
                  size={18}
                  strokeWidth={1.8}
                  color={t.k >= maxK - 0.01 ? colors.ink4 : colors.ink}
                />
              </CtlButton>
              <View className="h-px mx-2.5 bg-rule" />
              <CtlButton label="축소" disabled={t.k <= 1.01} onPress={() => pz.zoomBy(1 / 1.6)}>
                <Minus size={18} strokeWidth={1.8} color={t.k <= 1.01 ? colors.ink4 : colors.ink} />
              </CtlButton>
            </View>
            {moved ? (
              <View className="rounded-10 overflow-hidden border-hairline border-rule bg-paper">
                <CtlButton label="처음 위치로" onPress={pz.reset}>
                  <Locate size={18} strokeWidth={1.6} color={colors.ink} />
                </CtlButton>
              </View>
            ) : null}
          </View>
        </>
      ) : null}
    </View>
  );
}

function CtlButton({
  label,
  disabled,
  onPress,
  children,
}: {
  label: string;
  disabled?: boolean;
  onPress: () => void;
  children: React.ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      className="w-11 h-11 items-center justify-center active:opacity-60"
    >
      {children}
    </Pressable>
  );
}
