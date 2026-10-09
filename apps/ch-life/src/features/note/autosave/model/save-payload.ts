import { extractCitedRefs, type BlockNode } from "@/entities/note";

export type SaveState = {
  title: string | null;
  body: BlockNode[];
  sermonDate: string | null;
  preacher: string | null;
  location: string | null;
  scripture: string | null;
};

export type SavePayload = SaveState & { citedRefs: string[] };

export function buildSavePayload(state: SaveState): SavePayload {
  return {
    title: state.title,
    body: state.body,
    citedRefs: extractCitedRefs(state.body),
    sermonDate: state.sermonDate,
    preacher: state.preacher,
    location: state.location,
    scripture: state.scripture,
  };
}
