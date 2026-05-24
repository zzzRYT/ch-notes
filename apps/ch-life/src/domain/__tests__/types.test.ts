import type { Note, BlockNode } from "../types";

describe("domain types", () => {
  it("Note는 필수 필드를 가진다", () => {
    const note: Note = {
      id: "01HABC",
      title: null,
      body: [{ type: "paragraph", text: "" }],
      createdAt: 0,
      updatedAt: 0,
      citedRefs: [],
    };
    expect(note.body[0]?.type).toBe("paragraph");
  });

  it("BlockNode quote는 verses와 status를 가진다", () => {
    const q: BlockNode = {
      type: "quote",
      ref: "Col 3:20",
      verses: [
        { book: "Col", chapter: 3, verse: 20, text: "자녀들아..." },
      ],
      status: "loaded",
    };
    expect(q.type).toBe("quote");
    if (q.type === "quote") {
      expect(q.status).toBe("loaded");
    }
  });

  it("Note는 설교 메타데이터 필드를 가진다", () => {
    const note: Note = {
      id: "01HABC",
      title: "주일설교",
      body: [{ type: "paragraph", text: "" }],
      createdAt: 0,
      updatedAt: 0,
      citedRefs: [],
      sermonDate: "2026-05-24",
      preacher: "홍길동 목사",
      location: "본당",
      scripture: "요 3:16",
    };
    expect(note.sermonDate).toBe("2026-05-24");
    expect(note.preacher).toBe("홍길동 목사");
    expect(note.location).toBe("본당");
    expect(note.scripture).toBe("요 3:16");
  });
});
