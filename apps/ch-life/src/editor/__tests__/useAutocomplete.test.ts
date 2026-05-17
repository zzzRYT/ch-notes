import { detectRefAtCursor } from "../useAutocomplete";

describe("detectRefAtCursor", () => {
  it("커서 직전의 '골 3:20' 감지", () => {
    expect(detectRefAtCursor("오늘 본문은 골 3:20", 13)).toEqual({
      ref: "골 3:20",
      start: 7,
      end: 13,
    });
  });

  it("'골3:20' (공백 없음) 감지", () => {
    expect(detectRefAtCursor("골3:20", 5)).toEqual({
      ref: "골3:20",
      start: 0,
      end: 5,
    });
  });

  it("패턴 없으면 null", () => {
    expect(detectRefAtCursor("그냥 글자", 5)).toBeNull();
  });

  it("데드 ref (책 안 매칭)는 null", () => {
    expect(detectRefAtCursor("롤리 3:20", 8)).toBeNull();
  });

  it("데드 ref (존재하지 않는 절)도 null — 칩 안 뜸 정책", () => {
    expect(detectRefAtCursor("골 99:99", 8)).toBeNull();
  });

  it("커서가 ref 끝 바로 뒤에 있으면 감지 (' '나 다른 글자 직전)", () => {
    // "골 3:20 입니다" — 커서를 "0" 직후(=6)에 두면 감지
    expect(detectRefAtCursor("골 3:20 입니다", 6)).toEqual({
      ref: "골 3:20",
      start: 0,
      end: 6,
    });
  });

  it("커서 앞에 trailing 공백 있으면 패턴 불일치 → null", () => {
    // 공백이 끼면 \d$ 조건 깨짐, 안 뜨는 게 정상
    expect(detectRefAtCursor("골 3:20 입니다", 7)).toBeNull();
  });
});
