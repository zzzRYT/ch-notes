// 시간 순 정렬이 가능한 20자 대문자 id. 저장소와 마크다운 가져오기가 같은 규칙을 쓴다.
export function makeId(): string {
  const t = Date.now().toString(36).padStart(10, "0");
  const r = Math.random().toString(36).slice(2, 12).padStart(10, "0");
  return (t + r).toUpperCase();
}
