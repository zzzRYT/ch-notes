import React, { useEffect, useMemo, useState } from "react";
import { groupByCoord, fitMercator, regionBounds } from "../model/projection";
import type { Avoid } from "../model/labels";
import { PlaceMarker, type Glyph } from "./markers";
import { MapShell } from "./MapShell";
import { usePanZoom } from "./usePanZoom";

export type RegionPlace = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  glyph: Glyph;
  /** 시대 이름. 시대 미상이면 빈 문자열. */
  periodName: string;
};

type Props = {
  places: RegionPlace[];
  /** 선택(강조)한 장소. */
  focusId: string | null;
  onFocus: (id: string) => void;
  height?: number;
  onTouching?: (touching: boolean) => void;
};

const LIMITS = { minK: 1, maxK: 6, slack: 0.5 };

/**
 * 지역 확대 지도. 시대별 장소 표식을 그리고, 같은 좌표의 장소는 겹친 카드 표식 하나로 둔다(위치를 옮기지 않는다, R8).
 * 겹친 표식을 거듭 누르면 시대를 차례로 돈다. 지역이 바뀌면 부모가 key로 새로 만든다.
 */
export function RegionMap({ places, focusId, onFocus, height = 240, onTouching }: Props) {
  const [width, setWidth] = useState(0);
  const proj = useMemo(
    () => (width > 0 ? fitMercator(width, height, regionBounds(places), 4) : null),
    [places, width, height],
  );
  const pz = usePanZoom({ w: width || 1, h: height }, LIMITS);
  const groups = useMemo(() => groupByCoord(places), [places]);

  // 지도 밖으로 나간 장소를 고르면(목록에서) 그 자리로 옮긴다.
  const { centerOn } = pz;
  useEffect(() => {
    const p = places.find((q) => q.id === focusId);
    if (!p || !proj) return;
    const [sx, sy] = pz.screen(proj.project(p.lon, p.lat));
    if (sx < 60 || sx > width - 60 || sy < 50 || sy > height - 50)
      centerOn(proj.project(p.lon, p.lat));
    // pz.screen은 현재 변환을 ref로 읽는다. 이동할 때마다 다시 돌 필요가 없다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusId]);

  // 라벨 쪽은 기본 화면 좌표로 정한다: 여럿이면 가장 서쪽만 왼쪽, 하나면 오른쪽 여유가 없을 때 왼쪽.
  const westLon = Math.min(...groups.map((g) => g[0]!.lon));
  const sideOf = (g: RegionPlace[]): "left" | "right" => {
    if (!proj) return "right";
    if (groups.length > 1) return g[0]!.lon !== westLon ? "right" : "left";
    return proj.project(g[0]!.lon, g[0]!.lat)[0] < width * 0.62 ? "right" : "left";
  };

  const avoid = groups.map((g): Avoid => {
    const [x, y] = proj ? pz.screen(proj.project(g[0]!.lon, g[0]!.lat)) : [0, 0];
    return [x, y, sideOf(g), g[0]!.name.length * 13 + 90];
  });

  return (
    <MapShell
      height={height}
      pz={pz}
      proj={proj}
      maxK={LIMITS.maxK}
      river={2}
      avoid={avoid}
      onWidth={setWidth}
      onTouching={onTouching}
      radius={12}
    >
      {proj
        ? groups.map((g) => {
            const [x, y] = pz.screen(proj.project(g[0]!.lon, g[0]!.lat));
            const focused = g.find((p) => p.id === focusId);
            const shown = focused ?? g[0]!;
            const caption = g.length > 1 && !focused ? `${g.length}시대` : shown.periodName;
            return (
              <PlaceMarker
                key={g.map((p) => p.id).join("+")}
                x={x}
                y={y}
                side={sideOf(g)}
                name={shown.name}
                caption={caption}
                glyph={shown.glyph}
                stacked={g.length > 1}
                selected={!!focused}
                onPress={() =>
                  // 겹친 표식에서 이미 고른 장소가 있으면 다음 시대로 돈다.
                  onFocus(
                    g.length > 1 && focused ? g[(g.indexOf(focused) + 1) % g.length]!.id : shown.id,
                  )
                }
              />
            );
          })
        : null}
    </MapShell>
  );
}
