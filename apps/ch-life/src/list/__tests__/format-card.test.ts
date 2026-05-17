import { formatNoteCard } from "../format-card";
import type { Note } from "@/domain/types";

const base: Note = {
  id: "x",
  title: null,
  body: [],
  createdAt: 0,
  updatedAt: 0,
  citedRefs: [],
};

describe("formatNoteCard", () => {
  it("제목 있으면 제목을 메인 라벨로", () => {
    expect(
      formatNoteCard({ ...base, title: "주일설교" }).mainLabel,
    ).toBe("주일설교");
  });

  it("제목 없으면 'YYYY년 M월 D일 요일' 형식 (KST 기준)", () => {
    const ts = new Date("2026-05-17T10:00:00+09:00").getTime();
    const got = formatNoteCard({ ...base, updatedAt: ts }).mainLabel;
    // 일요일이라 spec상 '주일'로 변환 (Task 3.1 step 3 참고)
    expect(got).toMatch(/2026년 5월 17일/);
    expect(got).toMatch(/(일요일|주일)/);
  });

  it("citedRefs 3개까지 + 추가 개수", () => {
    expect(
      formatNoteCard({
        ...base,
        citedRefs: ["Col 3:20", "Eph 5:21", "Rom 8:28", "Jhn 3:16", "Psa 23:1"],
      }).refChips,
    ).toEqual({
      visible: ["Col 3:20", "Eph 5:21", "Rom 8:28"],
      moreCount: 2,
    });
  });

  it("citedRefs 1개면 moreCount 0", () => {
    expect(
      formatNoteCard({ ...base, citedRefs: ["Col 3:20"] }).refChips,
    ).toEqual({
      visible: ["Col 3:20"],
      moreCount: 0,
    });
  });

  it("citedRefs 비면 visible 빈 배열", () => {
    expect(formatNoteCard(base).refChips).toEqual({
      visible: [],
      moreCount: 0,
    });
  });

  it("title이 공백/빈문자면 날짜로 폴백", () => {
    const ts = new Date("2026-05-17T10:00:00+09:00").getTime();
    expect(
      formatNoteCard({ ...base, title: "   ", updatedAt: ts }).mainLabel,
    ).toMatch(/2026년/);
  });
});
