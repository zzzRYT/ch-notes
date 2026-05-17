import { noteToMarkdown } from "../serialize";
import { markdownToNote } from "../parse";
import type { Note } from "@/domain/types";

const note: Note = {
  id: "01HABC",
  title: "주일설교",
  body: [
    { type: "paragraph", text: "오늘 본문은 골 3:20" },
    {
      type: "quote",
      ref: "Col 3:20",
      verses: [
        {
          book: "Col",
          chapter: 3,
          verse: 20,
          text: "자녀들아 모든 일에 부모에게 순종하라",
        },
      ],
      status: "loaded",
    },
    { type: "paragraph", text: "이어지는 메모" },
  ],
  createdAt: 1747000000000,
  updatedAt: 1747001000000,
  citedRefs: ["Col 3:20"],
};

describe("markdown roundtrip", () => {
  it("DB → MD → DB가 본질 데이터를 보존한다", () => {
    const md = noteToMarkdown(note);
    const back = markdownToNote(md);
    expect(back).not.toBeNull();
    expect(back?.id).toBe(note.id);
    expect(back?.title).toBe(note.title);
    expect(back?.citedRefs).toEqual(note.citedRefs);
    expect(back?.body[0]).toEqual({
      type: "paragraph",
      text: "오늘 본문은 골 3:20",
    });
    expect(back?.body[1]?.type).toBe("quote");
    const quote = back?.body[1];
    if (quote && quote.type === "quote") {
      expect(quote.ref).toBe("Col 3:20");
      expect(quote.verses[0]?.text).toContain("자녀들아");
    }
    expect(back?.body[2]).toEqual({
      type: "paragraph",
      text: "이어지는 메모",
    });
  });

  it("frontmatter 없는 외부 MD도 새 노트로 받음", () => {
    const md = `자유 메모\n\n> **Col 3:20** (KRV)\n> 자녀들아\n`;
    const back = markdownToNote(md);
    expect(back).not.toBeNull();
    expect(back?.id).toBeTruthy(); // 새 id
    expect(back?.title).toBeNull();
    expect(back?.body[0]).toEqual({ type: "paragraph", text: "자유 메모" });
    expect(back?.body[1]?.type).toBe("quote");
    if (back?.body[1]?.type === "quote") {
      expect(back.body[1].ref).toBe("Col 3:20");
    }
  });

  it("citedRefs 누락 시 인용블록에서 자동 추출", () => {
    const md =
      `---\nid: X\nschemaVersion: 1\n---\n\n` +
      `> **Col 3:20** (KRV)\n> 자녀\n\n> **Eph 5:21** (KRV)\n> 서로\n`;
    const back = markdownToNote(md);
    expect(back?.citedRefs).toEqual(["Col 3:20", "Eph 5:21"]);
  });
});
