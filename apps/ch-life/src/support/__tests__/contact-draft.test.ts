import {
  buildContactDraft,
  buildMailtoUrl,
  EMBEDDED_LABEL,
  formatAppVersion,
  formatContactTime,
  formatDiagnostics,
  SUPPORT_EMAIL,
  type SupportEnv,
} from "../contact-draft";

const full: SupportEnv = {
  appVersion: "1.0.0",
  buildNumber: "12",
  osName: "ios",
  osVersion: "18.2",
  deviceName: "iPhone 15 Pro",
  updateId: "0f1e2d3c-4b5a-6978-8796-a5b4c3d2e1f0",
  channel: "production",
  runtimeVersion: "1.0.0",
};

const empty: SupportEnv = {
  appVersion: null,
  buildNumber: null,
  osName: "android",
  osVersion: null,
  deviceName: null,
  updateId: null,
  channel: null,
  runtimeVersion: null,
};

// jest는 TZ=Asia/Seoul로 돈다(package.json). 로컬 시각 포맷이 고정된다.
const NOW = new Date("2026-08-23T05:32:07.000Z"); // KST 14:32

describe("formatContactTime", () => {
  it("로컬 시각과 UTC 오프셋을 함께 적는다", () => {
    expect(formatContactTime(NOW)).toBe("2026-08-23 14:32 (UTC+09:00)");
  });

  it("한 자리 월·일·시·분을 0으로 채운다", () => {
    expect(formatContactTime(new Date("2026-01-05T00:03:00.000Z"))).toBe(
      "2026-01-05 09:03 (UTC+09:00)",
    );
  });
});

describe("formatAppVersion", () => {
  it("빌드 번호가 있으면 1.0.0+12 꼴로 붙인다", () => {
    expect(formatAppVersion(full)).toBe("1.0.0+12");
  });

  it("빌드 번호를 못 읽으면 버전만 남긴다 — Expo Go나 개발 실행", () => {
    expect(formatAppVersion({ ...full, buildNumber: null })).toBe("1.0.0");
    expect(formatAppVersion({ ...full, buildNumber: "" })).toBe("1.0.0");
  });

  it("둘 다 없으면 알 수 없음", () => {
    expect(formatAppVersion(empty)).toBe("알 수 없음");
  });
});

describe("formatDiagnostics", () => {
  it("값이 다 있으면 일곱 줄을 그대로 싣는다", () => {
    expect(formatDiagnostics(full, NOW)).toBe(
      [
        "문의 시각: 2026-08-23 14:32 (UTC+09:00)",
        "앱 버전: 1.0.0+12",
        "업데이트: 0f1e2d3c-4b5a-6978-8796-a5b4c3d2e1f0",
        "채널: production",
        "런타임: 1.0.0",
        "기기: iPhone 15 Pro",
        "운영체제: ios 18.2",
      ].join("\n"),
    );
  });

  // 채점표 3번: OTA를 아직 한 번도 발행하지 않은 지금이 이 경우다.
  it("OTA 식별자가 null이면 embedded로 적고 예외를 던지지 않는다", () => {
    const text = formatDiagnostics(empty, NOW);
    expect(text).toContain(`업데이트: ${EMBEDDED_LABEL}`);
    expect(text).toContain(`채널: ${EMBEDDED_LABEL}`);
  });

  it("OTA가 아닌 필드가 null이면 알 수 없음으로 적는다", () => {
    const text = formatDiagnostics(empty, NOW);
    expect(text).toContain("앱 버전: 알 수 없음");
    expect(text).toContain("기기: 알 수 없음");
    expect(text).toContain("운영체제: android 알 수 없음");
  });

  it("빈 문자열도 null과 같게 다룬다", () => {
    const text = formatDiagnostics({ ...full, deviceName: "", updateId: "" }, NOW);
    expect(text).toContain("기기: 알 수 없음");
    expect(text).toContain(`업데이트: ${EMBEDDED_LABEL}`);
  });
});

describe("buildContactDraft", () => {
  it("수신자는 공개된 지원 주소다", () => {
    expect(buildContactDraft(full, NOW).to).toBe(SUPPORT_EMAIL);
  });

  it("제목에 앱 버전이 들어간다", () => {
    expect(buildContactDraft(full, NOW).subject).toBe("[씀씀] 문의 (v1.0.0+12)");
    expect(buildContactDraft(empty, NOW).subject).toBe("[씀씀] 문의 (v알 수 없음)");
  });

  /**
   * 채점표 4번의 자동 게이트.
   *
   * 본문 전체를 문자 단위로 고정한다. 진단 블록에 필드를 하나라도 더 붙이면
   * 이 테스트가 깨지므로, 노트 콘텐츠가 실수로 실리는 변경은 리뷰가 아니라
   * 테스트에서 먼저 막힌다.
   */
  it("본문은 안내문 + 주입된 env 값으로만 이루어진다", () => {
    expect(buildContactDraft(full, NOW).body).toBe(
      [
        "문의하실 내용을 이 줄 위에 적어 주세요.",
        "",
        "--------------------",
        "아래는 문제를 확인하기 위한 정보입니다.",
        "지우고 보내셔도 되지만, 남겨 주시면 더 빨리 도와드릴 수 있습니다.",
        "",
        "문의 시각: 2026-08-23 14:32 (UTC+09:00)",
        "앱 버전: 1.0.0+12",
        "업데이트: 0f1e2d3c-4b5a-6978-8796-a5b4c3d2e1f0",
        "채널: production",
        "런타임: 1.0.0",
        "기기: iPhone 15 Pro",
        "운영체제: ios 18.2",
      ].join("\n"),
    );
  });

  it("사용자가 쓸 자리가 진단 블록보다 위에 있다", () => {
    const body = buildContactDraft(full, NOW).body;
    expect(body.indexOf("문의하실 내용")).toBeLessThan(body.indexOf("문의 시각"));
  });
});

describe("buildMailtoUrl", () => {
  it("수신자·제목·본문을 인코딩해 담는다", () => {
    const draft = buildContactDraft(full, NOW);
    const url = buildMailtoUrl(draft);

    expect(url.startsWith(`mailto:${SUPPORT_EMAIL}?`)).toBe(true);
    expect(url).toContain(`subject=${encodeURIComponent(draft.subject)}`);
    expect(url).toContain(`body=${encodeURIComponent(draft.body)}`);
  });

  it("개행과 한글이 URL을 깨뜨리지 않는다", () => {
    const url = buildMailtoUrl(buildContactDraft(full, NOW));

    expect(url).toContain("%0A");
    expect(url).not.toContain("\n");
    expect(url).not.toContain(" ");
    expect(() => new URL(url)).not.toThrow();
  });
});
