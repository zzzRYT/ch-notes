import { lookupVerses, parseRef } from "@/entities/scripture";
import type { MapData, MapNote, PlaceLink, SceneMatch } from "./types";

/**
 * 노트의 설교 본문·인용을 검토된 사건 범위와 대조해 (노트, 장소) 연결을 만든다.
 * 본문 조회에 실패하거나 역방향인 참조, 연결표에 없는 범위는 조용히 건너뛴다(R3).
 * 책 분류가 아니라 사건 범위로만 연결하므로 이전 시대를 언급하는 본문도 사건 시대를 따른다.
 */
export function matchNotes(
  notes: MapNote[],
  data: MapData,
  lookup: (ref: string) => unknown = lookupVerses,
): PlaceLink[] {
  const links = new Map<string, PlaceLink>();

  for (const note of notes) {
    const refs = [note.scripture, ...note.citedRefs].filter(
      (r): r is string => !!r?.trim(),
    );
    for (const ref of new Set(refs)) {
      const parsed = parseRef(ref);
      if (!parsed) continue;
      const to = parsed.end ?? parsed.verse;
      if (to < parsed.verse || !lookup(ref)) continue;

      for (const scene of data.scenes) {
        if (scene.book !== parsed.book || scene.chapter !== parsed.chapter) continue;
        const lo = Math.max(parsed.verse, scene.start);
        const hi = Math.min(to, scene.end);
        if (lo > hi) continue;

        const match: SceneMatch = {
          sceneId: scene.id,
          ref,
          chapter: scene.chapter,
          from: lo,
          to: hi,
        };
        for (const placeId of scene.placeIds) {
          const key = `${note.id}\u0000${placeId}`;
          const link = links.get(key) ?? { noteId: note.id, placeId, matches: [] };
          link.matches.push(match);
          links.set(key, link);
        }
      }
    }
  }
  return [...links.values()];
}

/** 시대 필터: undefined=전체, null=시대 미상, 문자열=시대 ID. */
export type PeriodFilter = string | null | undefined;

/** 요약 집계(R9). 노트는 고유 ID, 지역은 지역 묶음 키로 센다. */
export function summarize(
  links: PlaceLink[],
  data: MapData,
  period: PeriodFilter = undefined,
): { noteCount: number; regionCount: number } {
  const placeById = new Map(data.places.map((p) => [p.id, p]));
  const notes = new Set<string>();
  const regions = new Set<string>();
  for (const link of links) {
    const place = placeById.get(link.placeId);
    if (!place || (period !== undefined && place.periodId !== period)) continue;
    notes.add(link.noteId);
    regions.add(place.regionKey);
  }
  return { noteCount: notes.size, regionCount: regions.size };
}
