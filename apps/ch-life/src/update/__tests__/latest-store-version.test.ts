import { readLatestVersion } from "@/update/latest-store-version";

describe("readLatestVersion", () => {
  const payload = { ios: "1.0.3", android: "1.0.2" };

  it("플랫폼별로 따로 읽는다 — 심사 지연으로 두 스토어가 어긋난다", () => {
    expect(readLatestVersion(payload, "ios")).toBe("1.0.3");
    expect(readLatestVersion(payload, "android")).toBe("1.0.2");
  });

  it("모르는 키는 무시한다", () => {
    expect(readLatestVersion({ ...payload, _comment: "메모" }, "ios")).toBe(
      "1.0.3",
    );
  });

  it("빠졌거나 문자열이 아니면 null이다", () => {
    expect(readLatestVersion({ ios: "1.0.3" }, "android")).toBeNull();
    expect(readLatestVersion({ ios: 103 }, "ios")).toBeNull();
    expect(readLatestVersion({ ios: "  " }, "ios")).toBeNull();
    expect(readLatestVersion(null, "ios")).toBeNull();
    expect(readLatestVersion("1.0.3", "ios")).toBeNull();
  });
});
