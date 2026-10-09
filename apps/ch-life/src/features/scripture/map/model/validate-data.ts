import { lookupVerses } from "@/entities/scripture";
import type { MapData } from "./types";

/** 연결표의 무결성 오류 목록. 비어 있으면 통과. */
export function validateMapData(
  data: MapData,
  lookup: (ref: string) => unknown = lookupVerses,
): string[] {
  const errors: string[] = [];
  const dupes = (kind: string, ids: string[]) => {
    const seen = new Set<string>();
    for (const id of ids) {
      if (seen.has(id)) errors.push(`${kind} ID 중복: ${id}`);
      seen.add(id);
    }
  };
  dupes("시대", data.periods.map((p) => p.id));
  dupes("장소", data.places.map((p) => p.id));
  dupes("사건", data.scenes.map((s) => s.id));

  const periodIds = new Set(data.periods.map((p) => p.id));
  const placeIds = new Set(data.places.map((p) => p.id));

  for (const p of data.places) {
    if (p.periodId !== null && !periodIds.has(p.periodId))
      errors.push(`장소 ${p.id}: 없는 시대 ${p.periodId}`);
    if (!(Math.abs(p.lat) <= 90) || !(Math.abs(p.lon) <= 180))
      errors.push(`장소 ${p.id}: 비정상 좌표 ${p.lat}, ${p.lon}`);
    if (!p.source.trim()) errors.push(`장소 ${p.id}: 출처 없음`);
  }
  for (const s of data.scenes) {
    if (s.periodId !== null && !periodIds.has(s.periodId))
      errors.push(`사건 ${s.id}: 없는 시대 ${s.periodId}`);
    if (s.placeIds.length === 0) errors.push(`사건 ${s.id}: 장소 없음`);
    for (const id of s.placeIds)
      if (!placeIds.has(id)) errors.push(`사건 ${s.id}: 없는 장소 ${id}`);
    if (s.end < s.start) errors.push(`사건 ${s.id}: 끝 절이 시작 절보다 앞`);
    else if (!lookup(`${s.book} ${s.chapter}:${s.start}-${s.end}`))
      errors.push(`사건 ${s.id}: 본문에 없는 범위`);
  }
  return errors;
}
