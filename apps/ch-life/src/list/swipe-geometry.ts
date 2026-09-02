export function isHorizontalSwipe(dx: number, dy: number): boolean {
  return dx < -8 && Math.abs(dx) > Math.abs(dy) * 1.25;
}

export function settleSwipeOffset(dx: number, actionWidth: number): number {
  return dx <= -actionWidth / 2 ? -actionWidth : 0;
}

export function clampSwipeOffset(
  value: number,
  actionWidth: number,
): number {
  return Math.max(-actionWidth, Math.min(0, value));
}
