import { formatRef } from "../format-ref";
import { bookDisplayName } from "../book-map";

describe("formatRef — 축약 입력을 정식 책 이름으로 확장", () => {
  it("요 1:2 → 요한복음 1:2", () => {
    expect(formatRef("요 1:2")).toBe("요한복음 1:2");
  });

  it("창 1:1 → 창세기 1:1", () => {
    expect(formatRef("창 1:1")).toBe("창세기 1:1");
  });

  it("고전 1:1 → 고린도전서 1:1 (두 글자 축약)", () => {
    expect(formatRef("고전 1:1")).toBe("고린도전서 1:1");
  });

  it("계 22:21 → 요한계시록 22:21", () => {
    expect(formatRef("계 22:21")).toBe("요한계시록 22:21");
  });
});

describe("formatRef — 이미 정식 이름이거나 영어 입력", () => {
  it("요한복음 1:2 → 요한복음 1:2 (멱등)", () => {
    expect(formatRef("요한복음 1:2")).toBe("요한복음 1:2");
  });

  it("John 1:2 → 요한복음 1:2", () => {
    expect(formatRef("John 1:2")).toBe("요한복음 1:2");
  });
});

describe("formatRef — 범위 표기", () => {
  it("요 3:16-17 → 요한복음 3:16-17", () => {
    expect(formatRef("요 3:16-17")).toBe("요한복음 3:16-17");
  });

  it("끝 절이 시작 절과 같으면 범위를 생략한다", () => {
    expect(formatRef("요 3:16-16")).toBe("요한복음 3:16");
  });
});

describe("formatRef — 견고성", () => {
  it("앞뒤 공백을 정리한다", () => {
    expect(formatRef("  요 1:2  ")).toBe("요한복음 1:2");
  });

  it("파싱 불가한 입력은 공백만 정리해 그대로 반환한다", () => {
    expect(formatRef("롤리 1:1")).toBe("롤리 1:1");
  });

  it("빈 문자열은 빈 문자열", () => {
    expect(formatRef("")).toBe("");
  });
});

describe("bookDisplayName — 코드를 한국어 정식 이름으로", () => {
  it("Jhn → 요한복음", () => {
    expect(bookDisplayName("Jhn")).toBe("요한복음");
  });

  it("Gen → 창세기", () => {
    expect(bookDisplayName("Gen")).toBe("창세기");
  });

  it("Rev → 요한계시록", () => {
    expect(bookDisplayName("Rev")).toBe("요한계시록");
  });
});
