import { formatNoteCard } from "../format-card";
import type { Note } from "@/domain/types";

const base: Note = {
  id: "x",
  title: null,
  body: [],
  createdAt: 0,
  updatedAt: 0,
  citedRefs: [],
  sermonDate: null,
  preacher: null,
  location: null,
  scripture: null,
};

describe("formatNoteCard", () => {
  it("제목 있으면 제목을 title로", () => {
    expect(formatNoteCard({ ...base, title: "주일설교" }).title).toBe(
      "주일설교",
    );
  });

  it("제목 없으면 본문 미리보기로 폴백", () => {
    expect(
      formatNoteCard({
        ...base,
        body: [{ type: "paragraph", text: "은혜로운 말씀" }],
      }).title,
    ).toBe("은혜로운 말씀");
  });

  it("제목/본문 모두 없으면 (빈 노트)", () => {
    expect(formatNoteCard(base).title).toBe("(빈 노트)");
  });

  it("timeLabel 은 작성 시각 HH:mm (KST 기준)", () => {
    const ts = new Date("2026-05-17T10:32:00+09:00").getTime();
    expect(formatNoteCard({ ...base, createdAt: ts }).timeLabel).toBe("10:32");
  });

  it("preacher / scripture 는 trim 하고 빈 값은 null", () => {
    expect(
      formatNoteCard({ ...base, preacher: " 김요한 목사 ", scripture: "엡 2:8-10" }),
    ).toMatchObject({ preacher: "김요한 목사", scripture: "엡 2:8-10" });

    expect(
      formatNoteCard({ ...base, preacher: "   ", scripture: "" }),
    ).toMatchObject({ preacher: null, scripture: null });
  });
});
