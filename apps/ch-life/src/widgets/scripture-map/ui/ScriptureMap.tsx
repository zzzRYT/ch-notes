import React, { useMemo, useState } from "react";
import { View } from "react-native";
import Svg, { Circle, G, Path, Text as SvgText } from "react-native-svg";
import { useTheme } from "@/shared/ui";
import {
  layoutMarkers,
  makeProjection,
  type Anchor,
  type Bounds,
  type Marker,
  type Projection,
} from "../model/marker-layout";
import { TERRAIN } from "../model/terrain";

type Props = {
  anchors: Anchor[];
  bounds: Bounds;
  /** 표식 옆에 쓸 이름. */
  label: (marker: Marker) => string;
  /** 이 ID 중 하나라도 포함한 표식이 선택 표시된다. */
  selectedIds?: string[];
  onSelect: (marker: Marker) => void;
  accessibilityLabel: string;
};

/** 손가락 표적. 작은 표식도 이 반경 안을 누르면 선택된다. */
const HIT_RADIUS = 22;

function ringsToPath(rings: number[][], proj: Projection) {
  return rings
    .map((flat) => {
      const pts: string[] = [];
      for (let i = 0; i < flat.length; i += 2) {
        const { x, y } = proj.project(flat[i + 1]!, flat[i]!);
        pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
      }
      return `M${pts.join("L")}Z`;
    })
    .join("");
}

/**
 * 기기에 포함한 지형 위에 표식을 그린다. 이동·핀치 없음(KTD4).
 * 표식 선택은 부모가 목록 선택과 같은 상태로 다룬다 — 지도를 누르지 않아도 같은 기록을 열 수 있어야 한다(R7).
 */
export function ScriptureMap({
  anchors,
  bounds,
  label,
  selectedIds = [],
  onSelect,
  accessibilityLabel,
}: Props) {
  const { colors } = useTheme();
  const [width, setWidth] = useState(0);
  const proj = useMemo(() => (width > 0 ? makeProjection(bounds, width) : null), [bounds, width]);

  const markers = useMemo(
    () => (proj ? layoutMarkers(anchors, proj, HIT_RADIUS * 2) : []),
    [anchors, proj],
  );
  const land = useMemo(() => (proj ? ringsToPath(TERRAIN.land, proj) : ""), [proj]);
  const lakes = useMemo(
    () => (proj ? TERRAIN.lakes.map((l) => ringsToPath(l.rings, proj)) : []),
    [proj],
  );

  return (
    <View
      onLayout={(e) => setWidth(Math.round(e.nativeEvent.layout.width))}
      // 지형은 장식이다. 같은 정보는 아래 목록에서 읽는다.
      accessible
      accessibilityLabel={accessibilityLabel}
      className="mx-5.5 rounded-16 overflow-hidden border-hairline border-rule bg-paper"
      style={proj ? { height: proj.height } : { height: 240 }}
    >
      {proj ? (
        <Svg width={proj.width} height={proj.height}>
          <Path d={land} fill={colors.chipBg} stroke={colors.ink4} strokeWidth={0.75} />
          {lakes.map((d, i) => (
            <Path key={i} d={d} fill={colors.paper} stroke={colors.ink4} strokeWidth={0.75} />
          ))}
          {markers.map((m) => {
            const selected = m.ids.some((id) => selectedIds.includes(id));
            const multi = m.ids.length > 1;
            const r = multi ? 11 : 6;
            const text = label(m);
            const flip = m.x > proj.width * 0.55;
            return (
              <G key={m.key} onPress={() => onSelect(m)}>
                <Circle cx={m.x} cy={m.y} r={HIT_RADIUS} fill="transparent" />
                <Circle
                  cx={m.x}
                  cy={m.y}
                  r={r}
                  fill={selected ? colors.accent : colors.paper}
                  stroke={selected ? colors.accent : colors.ink}
                  strokeWidth={multi ? 2 : 1.5}
                />
                {multi ? (
                  <SvgText
                    x={m.x}
                    y={m.y + 4}
                    fontSize={11}
                    fontWeight="700"
                    textAnchor="middle"
                    fill={selected ? colors.accentText : colors.ink}
                  >
                    {m.ids.length}
                  </SvgText>
                ) : null}
                {/* 배경색 윤곽을 먼저 깔아 지형 위에서도 읽히게 한다. */}
                {[true, false].map((halo) => (
                  <SvgText
                    key={String(halo)}
                    x={m.x + (flip ? -(r + 6) : r + 6)}
                    y={m.y + 4}
                    fontSize={12}
                    fontWeight="600"
                    textAnchor={flip ? "end" : "start"}
                    fill={halo ? colors.chipBg : colors.ink}
                    stroke={halo ? colors.chipBg : undefined}
                    strokeWidth={halo ? 3 : undefined}
                  >
                    {text}
                  </SvgText>
                ))}
              </G>
            );
          })}
        </Svg>
      ) : null}
    </View>
  );
}
