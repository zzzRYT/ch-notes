import {
  detectRefAtCursor,
  detectTriggeredRef,
  splitAtRef,
} from "../useAutocomplete";

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

  it("범위 '창 1:1-3' 감지 — 절 범위 포함", () => {
    expect(detectRefAtCursor("본문 창 1:1-3", 10)).toEqual({
      ref: "창 1:1-3",
      start: 3,
      end: 10,
    });
  });

  it("범위 '창1:1-3' (공백 없음) 감지", () => {
    expect(detectRefAtCursor("창1:1-3", 6)).toEqual({
      ref: "창1:1-3",
      start: 0,
      end: 6,
    });
  });

  it("데드 범위 (끝 절이 시작보다 작음)는 null", () => {
    expect(detectRefAtCursor("창 1:3-1", 8)).toBeNull();
  });
});

describe("detectTriggeredRef", () => {
  it("문단 중간에서 인용해도 트리거 (아래에 글이 남아있음)", () => {
    // "안녕하세요\n창 1:1\n누구세요?" 의 가운데 줄에서 space 입력
    const prev = "안녕하세요\n창 1:1\n누구세요?";
    const next = "안녕하세요\n창 1:1 \n누구세요?";
    const triggered = detectTriggeredRef(prev, next);
    expect(triggered).toEqual({
      detected: { ref: "창 1:1", start: 6, end: 11 },
      textWithoutTrigger: "안녕하세요\n창 1:1\n누구세요?",
    });
    // 인용 뒤 텍스트(아래 줄)는 tail 로 보존된다
    expect(splitAtRef(triggered!.textWithoutTrigger, triggered!.detected)).toEqual({
      head: "안녕하세요",
      tail: "\n누구세요?",
    });
  });

  it("문단 중간 범위 인용도 트리거되고 tail 보존", () => {
    const prev = "앞\n창 1:1-3\n뒤";
    const next = "앞\n창 1:1-3 \n뒤";
    const triggered = detectTriggeredRef(prev, next);
    expect(triggered).toEqual({
      detected: { ref: "창 1:1-3", start: 2, end: 9 },
      textWithoutTrigger: "앞\n창 1:1-3\n뒤",
    });
    expect(splitAtRef(triggered!.textWithoutTrigger, triggered!.detected)).toEqual({
      head: "앞",
      tail: "\n뒤",
    });
  });

  it("문장 중간 ref 뒤에 공백을 넣으면 앞뒤 문장을 나눈다", () => {
    const prev = "안녕하세요 창1:1누구세요";
    const next = "안녕하세요 창1:1 누구세요";
    const triggered = detectTriggeredRef(prev, next);
    expect(triggered).toEqual({
      detected: { ref: "창1:1", start: 6, end: 10 },
      textWithoutTrigger: "안녕하세요 창1:1누구세요",
    });
    expect(splitAtRef(triggered!.textWithoutTrigger, triggered!.detected)).toEqual({
      head: "안녕하세요",
      tail: "누구세요",
    });
  });

  it("한 번의 변경으로 문장 중간 ref 형태가 만들어져도 트리거", () => {
    const triggered = detectTriggeredRef("", "안녕하세요 창1:1 누구세요");
    expect(triggered).toEqual({
      detected: { ref: "창1:1", start: 6, end: 10 },
      textWithoutTrigger: "안녕하세요 창1:1누구세요",
    });
    expect(splitAtRef(triggered!.textWithoutTrigger, triggered!.detected)).toEqual({
      head: "안녕하세요",
      tail: "누구세요",
    });
  });

  it("문단 끝에서 입력하는 기존 동작도 유지", () => {
    const triggered = detectTriggeredRef("창 1:1", "창 1:1 ");
    expect(triggered).toEqual({
      detected: { ref: "창 1:1", start: 0, end: 5 },
      textWithoutTrigger: "창 1:1",
    });
  });

  it("엔터(개행)로도 트리거 — 문단 끝", () => {
    const triggered = detectTriggeredRef("창 1:1", "창 1:1\n");
    expect(triggered).toEqual({
      detected: { ref: "창 1:1", start: 0, end: 5 },
      textWithoutTrigger: "창 1:1",
    });
  });

  it("엔터(개행)로 트리거 — 아래 줄과 붙은 개행도 ref 끝을 정확히 잡음", () => {
    // 가운데 줄에서 엔터: 새 \n 이 다음 줄 앞의 기존 \n 과 인접해 위치가 모호
    const prev = "안녕하세요\n창 1:1\n누구세요?";
    const next = "안녕하세요\n창 1:1\n\n누구세요?";
    const triggered = detectTriggeredRef(prev, next);
    expect(triggered).toEqual({
      detected: { ref: "창 1:1", start: 6, end: 11 },
      textWithoutTrigger: "안녕하세요\n창 1:1\n누구세요?",
    });
    expect(splitAtRef(triggered!.textWithoutTrigger, triggered!.detected)).toEqual({
      head: "안녕하세요",
      tail: "\n누구세요?",
    });
  });

  it("공백이 아닌 글자 입력은 트리거 아님", () => {
    expect(detectTriggeredRef("창 1:", "창 1:1")).toBeNull();
  });

  it("삭제(길이 감소)는 트리거 아님", () => {
    expect(detectTriggeredRef("창 1:1 ", "창 1:1")).toBeNull();
  });

  it("공백을 쳤지만 유효한 ref 가 아니면 트리거 아님", () => {
    expect(detectTriggeredRef("안녕", "안녕 ")).toBeNull();
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
