export type LabelItem = {
  key: string;
  x: number;
  y: number;
  chipWidth: number;
};

/**
 * 표식 라벨을 어느 쪽에 놓을지. 오른쪽이 기본이고, 화면 오른쪽 끝에 가깝거나
 * 오른쪽의 다른 표식 라벨과 겹치면 왼쪽에 둔다. 확대·이동으로 바뀌지 않게 기본 화면 좌표(k=1)로 정한다.
 */
export function labelSides(items: LabelItem[], width: number): Record<string, "left" | "right"> {
  const out: Record<string, "left" | "right"> = {};
  for (const a of items) {
    const blocked = items.some(
      (b) => b !== a && b.x > a.x && b.x - a.x < a.chipWidth + 38 && Math.abs(b.y - a.y) < 34,
    );
    out[a.key] = blocked || a.x > width * 0.64 ? "left" : "right";
  }
  return out;
}
