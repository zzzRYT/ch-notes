import type { NoteRepo } from "@/entities/note";

/** 빈 문단 하나로 새 노트를 만든다. 폰 목록과 태블릿 작업공간이 같은 모양을 쓴다. */
export function createBlankNote(repo: NoteRepo): Promise<string> {
  return repo.create({
    title: null,
    body: [{ type: "paragraph", text: "" }],
    citedRefs: [],
  });
}
