import {
  formatYmd,
  parseYmd,
  formatKoreanDate,
  buildMonthGrid,
  addMonths,
} from "../calendar";

describe("calendar helpers", () => {
  it("formatYmd는 로컬 날짜를 YYYY-MM-DD로 만든다", () => {
    expect(formatYmd(new Date(2026, 4, 24))).toBe("2026-05-24");
    expect(formatYmd(new Date(2026, 0, 1))).toBe("2026-01-01");
  });

  it("parseYmd는 유효한 문자열을 Date로, 그 외엔 null", () => {
    const d = parseYmd("2026-05-24");
    expect(d?.getFullYear()).toBe(2026);
    expect(d?.getMonth()).toBe(4);
    expect(d?.getDate()).toBe(24);
    expect(parseYmd("garbage")).toBeNull();
    expect(parseYmd("2026-13-01")).toBeNull();
  });

  it("formatKoreanDate는 한국어 표기를 만든다", () => {
    expect(formatKoreanDate("2026-05-24")).toBe("2026년 5월 24일");
  });

  it("buildMonthGrid는 42칸 격자에 해당 월 날짜를 배치한다", () => {
    const grid = buildMonthGrid(2026, 4); // 2026년 5월
    expect(grid).toHaveLength(42);
    expect(grid).toContain("2026-05-01");
    expect(grid).toContain("2026-05-31");
    const firstWeekday = new Date(2026, 4, 1).getDay();
    expect(grid[firstWeekday]).toBe("2026-05-01");
    if (firstWeekday > 0) expect(grid[firstWeekday - 1]).toBeNull();
  });

  it("addMonths는 연·월 경계를 넘긴다", () => {
    expect(addMonths(2026, 11, 1)).toEqual({ year: 2027, month0: 0 });
    expect(addMonths(2026, 0, -1)).toEqual({ year: 2025, month0: 11 });
  });
});
