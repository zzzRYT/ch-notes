/**
 * 스토어 버전 비교.
 *
 * 비교 대상은 iOS `CFBundleShortVersionString` 규칙을 따르는 문자열이다 —
 * **숫자와 점만** 허용한다(`wiki/git.md` 5절, ADR-0021). `1.0.10 > 1.0.9`이므로
 * 문자열 비교를 쓸 수 없다.
 *
 * 자리 수가 다르면 짧은 쪽을 0으로 채운다 — `1.0`과 `1.0.0`은 같은 버전이다.
 */

/** 정규화된 숫자 배열. 형식이 어긋나면 `null`. */
function parse(version: string): number[] | null {
  if (typeof version !== "string") return null;
  const trimmed = version.trim();
  if (!/^\d+(\.\d+)*$/.test(trimmed)) return null;
  const parts = trimmed.split(".").map((p) => Number(p));
  if (parts.some((n) => !Number.isSafeInteger(n))) return null;
  return parts;
}

/**
 * `a`가 `b`보다 크면 1, 같으면 0, 작으면 -1.
 * 어느 한쪽이라도 형식이 어긋나면 **`null`** — 비교하지 않는다.
 *
 * 호출부는 `null`을 "업데이트 안내를 하지 않는다"로 다뤄야 한다.
 * 잘못된 값 때문에 어르신에게 없는 업데이트를 안내하는 쪽이 더 나쁘다.
 */
export function compareAppVersion(a: string, b: string): -1 | 0 | 1 | null {
  const left = parse(a);
  const right = parse(b);
  if (!left || !right) return null;

  const length = Math.max(left.length, right.length);
  for (let i = 0; i < length; i += 1) {
    const l = left[i] ?? 0;
    const r = right[i] ?? 0;
    if (l > r) return 1;
    if (l < r) return -1;
  }
  return 0;
}

/** 스토어에 설치본보다 새 버전이 있는가. 형식이 어긋나면 `false`. */
export function isStoreVersionNewer(
  latest: string,
  installed: string,
): boolean {
  return compareAppVersion(latest, installed) === 1;
}
