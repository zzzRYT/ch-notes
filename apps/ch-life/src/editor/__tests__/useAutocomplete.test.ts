import { detectRefAtCursor, splitAtRef } from "../useAutocomplete";

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

  it("범위 인용 '창세기 1:1-3' 감지 (하이픈)", () => {
    expect(detectRefAtCursor("창세기 1:1-3", 9)).toEqual({
      ref: "창세기 1:1-3",
      start: 0,
      end: 9,
    });
  });

  it("범위 인용 '창 1:1-3' 감지 (약어)", () => {
    expect(detectRefAtCursor("창 1:1-3", 7)).toEqual({
      ref: "창 1:1-3",
      start: 0,
      end: 7,
    });
  });

  it("범위 인용 '창세기 1:1~3' 감지 (물결표)", () => {
    expect(detectRefAtCursor("창세기 1:1~3", 9)).toEqual({
      ref: "창세기 1:1~3",
      start: 0,
      end: 9,
    });
  });

  it("앞 글자 뒤 범위 인용도 head 분리", () => {
    expect(detectRefAtCursor("오늘 본문은 창세기 1:1-3", 16)).toEqual({
      ref: "창세기 1:1-3",
      start: 7,
      end: 16,
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

describe("splitAtRef", () => {
  it("ref만 입력했으면 head/tail 모두 비어 ref가 통째로 사라진다", () => {
    const before = "골 3:20";
    const detected = detectRefAtCursor(before, before.length)!;
    expect(splitAtRef(before, detected)).toEqual({ head: "", tail: "" });
  });

  it("앞에 글이 있으면 head로 남고 ref와 직전 공백은 사라진다", () => {
    const before = "오늘 본문은 골 3:20";
    const detected = detectRefAtCursor(before, before.length)!;
    expect(splitAtRef(before, detected)).toEqual({
      head: "오늘 본문은",
      tail: "",
    });
  });

  it("ref 뒤 텍스트는 tail로 분리된다", () => {
    // "서두 골 3:20 결론" — ref "골 3:20"은 인덱스 3..9
    const detected = { ref: "골 3:20", start: 3, end: 9 };
    expect(splitAtRef("서두 골 3:20 결론", detected)).toEqual({
      head: "서두",
      tail: " 결론",
    });
  });
});
