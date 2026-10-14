/**
 * WebView의 doc-ready 대기 (#119).
 *
 * `RichNoteEditor`는 웹이 "준비됨"을 알려야 스켈레톤을 걷는다.
 * 이 알림이 오지 않으면(웹뷰 크래시·메시지 유실) 스켈레톤이 영원히 남으므로,
 * 기한 안에 안 오면 `onTimeout`을 한 번 호출해 에러 UI로 전환한다.
 * 네트워크와 무관한 로컬 타이머다.
 */
export type DocReadyTimeout = {
  /** 대기 시작. 이미 시작됐으면 처음부터 다시 센다. */
  start: () => void;
  /** doc-ready가 왔다 — 타이머를 멈춘다. */
  ready: () => void;
  /** 정리. 이후 onTimeout은 호출되지 않는다. */
  dispose: () => void;
};

export function createDocReadyTimeout(
  timeoutMs: number,
  onTimeout: () => void,
): DocReadyTimeout {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let done = false;

  const clear = () => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  };

  return {
    start() {
      clear();
      done = false;
      timer = setTimeout(() => {
        timer = null;
        if (!done) {
          done = true;
          onTimeout();
        }
      }, timeoutMs);
    },
    ready() {
      done = true;
      clear();
    },
    dispose() {
      done = true;
      clear();
    },
  };
}
