import React, { useEffect, useMemo, useRef, useState } from "react";
import { labelSides } from "../model/label-side";
import type { Avoid } from "../model/labels";
import { OVERVIEW_BOUNDS, fitMercator } from "../model/projection";
import { RegionMarker } from "./markers";
import { MapShell } from "./MapShell";
import { usePanZoom } from "./usePanZoom";

export type OverviewRegion = {
  key: string;
  name: string;
  lat: number;
  lon: number;
  /** 지역 안의 고유 노트 수. */
  noteCount: number;
  periodCount: number;
};

type Props = {
  regions: OverviewRegion[];
  selectedKey: string | null;
  /** 이미 고른 지역을 다시 누르면 null. */
  onSelect: (key: string | null) => void;
  height?: number;
  onTouching?: (touching: boolean) => void;
};

const LIMITS = { minK: 1, maxK: 10, slack: 0.35 };
/** 지역을 고를 때 이동·확대하는 배율. */
const FOCUS_K = 2.6;

const chipWidth = (r: OverviewRegion) => r.name.length * 13 + 34 + (r.periodCount > 1 ? 34 : 0);

/**
 * 전체 지도. 지역마다 묶음 표식 하나를 두고, 지역을 고르면 그 위치로 이동·확대한다.
 * 선택은 부모가 목록과 같은 상태로 다룬다 — 지도를 누르지 않아도 같은 기록을 열 수 있어야 한다(R7).
 */
export function OverviewMap({ regions, selectedKey, onSelect, height = 400, onTouching }: Props) {
  const [width, setWidth] = useState(0);
  const proj = useMemo(
    () => (width > 0 ? fitMercator(width, height, OVERVIEW_BOUNDS) : null),
    [width, height],
  );
  const pz = usePanZoom({ w: width || 1, h: height }, LIMITS);

  const placed = useMemo(
    () => (proj ? regions.map((r) => ({ r, p: proj.project(r.lon, r.lat) })) : []),
    [regions, proj],
  );
  const sides = useMemo(
    () =>
      labelSides(
        placed.map(({ r, p }) => ({
          key: r.key,
          x: p[0],
          y: p[1],
          chipWidth: chipWidth(r),
        })),
        width,
      ),
    [placed, width],
  );

  // 지역을 고르면 그 위치로, 해제하면 전체로. 처음 그릴 때는 애니메이션 없이 자리를 잡는다.
  const first = useRef(true);
  const { centerOn, reset, t } = pz;
  useEffect(() => {
    if (!proj) return;
    const hit = placed.find(({ r }) => r.key === selectedKey);
    if (hit) centerOn(hit.p, first.current ? FOCUS_K : Math.max(FOCUS_K, t.k), !first.current);
    else if (!first.current) reset();
    first.current = false;
    // t.k는 의도적으로 뺐다 — 확대할 때마다 다시 이동하면 손으로 조작할 수 없다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKey, proj]);

  const avoid = placed.map(
    ({ r, p }): Avoid => [...pz.screen(p), sides[r.key] ?? "right", chipWidth(r)] as Avoid,
  );

  return (
    <MapShell
      height={height}
      pz={pz}
      proj={proj}
      maxK={LIMITS.maxK}
      river={1.4}
      avoid={avoid}
      onWidth={setWidth}
      onTouching={onTouching}
    >
      {placed.map(({ r, p }) => {
        const [x, y] = pz.screen(p);
        const selected = r.key === selectedKey;
        return (
          <RegionMarker
            key={r.key}
            x={x}
            y={y}
            side={sides[r.key] ?? "right"}
            name={r.name}
            noteCount={r.noteCount}
            periodCount={r.periodCount}
            selected={selected}
            onPress={() => onSelect(selected ? null : r.key)}
          />
        );
      })}
    </MapShell>
  );
}
