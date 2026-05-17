import { noteToMarkdown, noteFileName } from "../serialize";
import type { Note } from "@/domain/types";

const sample: Note = {
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
        {
          book: "Col",
          chapter: 3,
          verse: 21,
          text: "이는 주 안에서 기쁘게 하는 것이니라",
        },
      ],
      status: "loaded",
    },
  ],
  createdAt: 1747000000000,
  updatedAt: 1747001000000,
  citedRefs: ["Col 3:20"],
};

describe("noteToMarkdown", () => {
  it("frontmatter + 본문 + 인용블록", () => {
    const md = noteToMarkdown(sample);
    expect(md).toContain("id: 01HABC");
    expect(md).toContain("title: 주일설교");
    expect(md).toContain("schemaVersion: 1");
    expect(md).toContain("오늘 본문은 골 3:20");
    expect(md).toContain("> **Col 3:20** (KRV)");
    expect(md).toContain("> 자녀들아 모든 일에 부모에게 순종하라");
    expect(md).toContain("> 이는 주 안에서 기쁘게 하는 것이니라");
  });

  it("citedRefs를 frontmatter에 배열로 포함", () => {
    const md = noteToMarkdown(sample);
    expect(md).toMatch(/citedRefs:\s*\n\s*-\s*['"]?Col 3:20['"]?/);
  });

  it("title 없으면 frontmatter에 title 키 자체가 없음", () => {
    const md = noteToMarkdown({ ...sample, title: null });
    expect(md).not.toMatch(/^title:/m);
  });
});

describe("noteFileName", () => {
  it("'YYYY-MM-DD-slug.md'", () => {
    const name = noteFileName(sample);
    expect(name).toMatch(/^\d{4}-\d{2}-\d{2}-주일설교\.md$/);
  });

  it("title 없으면 id 뒤 일부 사용", () => {
    const name = noteFileName({ ...sample, title: null });
    expect(name).toMatch(/^\d{4}-\d{2}-\d{2}-[A-Z0-9]+\.md$/);
    expect(name).toContain("HABC.md");
  });
});
