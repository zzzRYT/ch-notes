import type { MapData, MapNote, Period, Place, PlaceLink } from "./types";
import type { PeriodFilter } from "./match-notes";

/** 화면이 노트 한 줄을 그리는 데 필요한 필드. */
export type ViewNote = MapNote & { title: string | null; createdAt: number };

export type PlaceView = {
  place: Place;
  /** 시대 미상이면 null. */
  period: Period | null;
  notes: { note: ViewNote; refs: string[] }[];
};

export type RegionView = {
  key: string;
  name: string;
  /** 지역 안의 고유 노트 수. 장소별 수의 합이 아니다(R9). */
  noteCount: number;
  places: PlaceView[];
};

/**
 * 연결을 지역 → 시대별 장소 → 노트로 묶는다. 시대 필터는 장소의 시대로 거른다.
 * 연결이 없는 지역·장소는 만들지 않는다(R3). 시대 순, 시대 미상은 맨 뒤.
 */
export function buildRegions(
  links: PlaceLink[],
  notes: ViewNote[],
  data: MapData,
  period: PeriodFilter = undefined,
): RegionView[] {
  const noteById = new Map(notes.map((n) => [n.id, n]));
  const placeById = new Map(data.places.map((p) => [p.id, p]));
  const periodById = new Map(data.periods.map((p) => [p.id, p]));

  const regions = new Map<string, RegionView>();
  const placeViews = new Map<string, PlaceView>();
  const regionNotes = new Map<string, Set<string>>();

  for (const link of links) {
    const place = placeById.get(link.placeId);
    const note = noteById.get(link.noteId);
    if (!place || !note || (period !== undefined && place.periodId !== period)) continue;

    let view = placeViews.get(place.id);
    if (!view) {
      view = { place, period: (place.periodId && periodById.get(place.periodId)) || null, notes: [] };
      placeViews.set(place.id, view);
      const region = regions.get(place.regionKey) ?? {
        key: place.regionKey,
        name: place.regionName,
        noteCount: 0,
        places: [],
      };
      region.places.push(view);
      regions.set(region.key, region);
    }
    view.notes.push({ note, refs: [...new Set(link.matches.map((m) => m.ref))] });

    const seen = regionNotes.get(place.regionKey) ?? new Set<string>();
    seen.add(note.id);
    regionNotes.set(place.regionKey, seen);
  }

  const order = (v: PlaceView) => v.period?.order ?? Infinity;
  for (const region of regions.values()) {
    region.noteCount = regionNotes.get(region.key)!.size;
    region.places.sort((a, b) => order(a) - order(b));
  }
  return [...regions.values()].sort(
    (a, b) => b.noteCount - a.noteCount || a.name.localeCompare(b.name, "ko"),
  );
}
