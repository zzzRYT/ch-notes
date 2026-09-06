import {
  compareAppVersion,
  isStoreVersionNewer,
} from "@/update/compare-version";

describe("compareAppVersion", () => {
  it("숫자로 비교한다 — 1.0.10이 1.0.9보다 크다", () => {
    expect(compareAppVersion("1.0.10", "1.0.9")).toBe(1);
    expect(compareAppVersion("1.0.9", "1.0.10")).toBe(-1);
    expect(compareAppVersion("2.0.0", "1.9.9")).toBe(1);
  });

  it("같은 버전은 0이다", () => {
    expect(compareAppVersion("1.0.2", "1.0.2")).toBe(0);
  });

  it("자리 수가 달라도 0으로 채워 비교한다", () => {
    expect(compareAppVersion("1.0", "1.0.0")).toBe(0);
    expect(compareAppVersion("1.0.1", "1.0")).toBe(1);
    expect(compareAppVersion("1", "1.0.1")).toBe(-1);
  });

  it("형식이 어긋나면 null이다 — 비교하지 않는다", () => {
    expect(compareAppVersion("1.0.2-beta", "1.0.1")).toBeNull();
    expect(compareAppVersion("v1.0.2", "1.0.1")).toBeNull();
    expect(compareAppVersion("", "1.0.1")).toBeNull();
    expect(compareAppVersion("1.0.1", "알 수 없음")).toBeNull();
  });
});

describe("isStoreVersionNewer", () => {
  it("스토어가 더 높을 때만 true다", () => {
    expect(isStoreVersionNewer("1.0.2", "1.0.1")).toBe(true);
    expect(isStoreVersionNewer("1.0.1", "1.0.1")).toBe(false);
    expect(isStoreVersionNewer("1.0.0", "1.0.1")).toBe(false);
  });

  it("형식이 어긋나면 안내하지 않는다", () => {
    expect(isStoreVersionNewer("최신", "1.0.1")).toBe(false);
    expect(isStoreVersionNewer("1.0.2", "")).toBe(false);
  });
});
