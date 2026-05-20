import {
  groupNotesByDay,
  formatTime,
  notePreview,
  noteTitleOrFallback,
} from "../group-notes";
import type { Note } from "@/domain/types";

const base: Note = {
  id: "x",
  title: null,
  body: [],
  createdAt: 0,
  updatedAt: 0,
  citedRefs: [],
};

function noteOn(iso: string, overrides: Partial<Note> = {}): Note {
  const ts = new Date(iso).getTime();
  return { ...base, id: iso, updatedAt: ts, createdAt: ts, ...overrides };
}

describe("groupNotesByDay", () => {
  it("그룹은 날짜별로 묶고 최신 날짜가 먼저 오게 정렬", () => {
    const notes = [
      noteOn("2026-05-10T11:00:00+09:00"),
      noteOn("2026-05-17T10:32:00+09:00"),
      noteOn("2026-05-17T18:00:00+09:00"),
    ];
    const groups = groupNotesByDay(notes);
    expect(groups.map((g) => g.key)).toEqual(["2026-05-17", "2026-05-10"]);
    expect(groups[0]!.notes).toHaveLength(2);
    expect(groups[1]!.notes).toHaveLength(1);
  });

  it("같은 날 노트는 createdAt 내림차순 (updatedAt 무시)", () => {
    const a = noteOn("2026-05-17T10:00:00+09:00", { id: "a" });
    const b = noteOn("2026-05-17T18:00:00+09:00", { id: "b" });
    const groups = groupNotesByDay([a, b]);
    expect(groups[0]!.notes.map((n) => n.id)).toEqual(["b", "a"]);
  });

  it("그룹핑은 createdAt 기준 — updatedAt이 다른 날이어도 createdAt 날짜로 묶임", () => {
    const createdTs = new Date("2026-05-17T10:00:00+09:00").getTime();
    const updatedTs = new Date("2026-05-18T11:00:00+09:00").getTime();
    const n: Note = {
      ...base,
      id: "n",
      createdAt: createdTs,
      updatedAt: updatedTs,
    };
    const groups = groupNotesByDay([n]);
    expect(groups[0]!.key).toBe("2026-05-17");
  });

  it("date/dow 포맷", () => {
    const groups = groupNotesByDay([
      noteOn("2026-05-17T10:32:00+09:00"),
    ]);
    expect(groups[0]!.date).toBe("5월 17일");
    expect(groups[0]!.dow).toBe("주일");
  });
});

describe("formatTime", () => {
  it("HH:mm 24시간 포맷", () => {
    const ts = new Date("2026-05-17T09:05:00+09:00").getTime();
    expect(formatTime(ts)).toBe("09:05");
  });
});

describe("notePreview / noteTitleOrFallback", () => {
  it("첫 paragraph 본문에서 미리보기 생성", () => {
    const n: Note = {
      ...base,
      body: [
        { type: "paragraph", text: "" },
        { type: "paragraph", text: "은혜의 복음은 행위에서 나지 않는다." },
      ],
    };
    expect(notePreview(n)).toBe("은혜의 복음은 행위에서 나지 않는다.");
  });

  it("타이틀 없으면 본문 앞부분으로 폴백", () => {
    const n: Note = {
      ...base,
      title: null,
      body: [{ type: "paragraph", text: "오늘의 설교 — 산상수훈" }],
    };
    expect(noteTitleOrFallback(n)).toBe("오늘의 설교 — 산상수훈");
  });

  it("본문 없고 타이틀도 없으면 '(빈 노트)'", () => {
    expect(noteTitleOrFallback(base)).toBe("(빈 노트)");
  });
});
