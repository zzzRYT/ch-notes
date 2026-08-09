import {
  clampSwipeOffset,
  isHorizontalSwipe,
  settleSwipeOffset,
} from "../swipe-geometry";

it("세로 스크롤보다 뚜렷한 왼쪽 이동만 가로 제스처로 잡는다", () => {
  expect(isHorizontalSwipe(-12, 3)).toBe(true);
  expect(isHorizontalSwipe(-4, 16)).toBe(false);
  expect(isHorizontalSwipe(12, 3)).toBe(false);
});

it("절반 이상 밀면 삭제 폭까지 열고 아니면 닫는다", () => {
  expect(settleSwipeOffset(-50, 84)).toBe(-84);
  expect(settleSwipeOffset(-30, 84)).toBe(0);
});

it("이동값을 삭제 폭과 닫힌 위치 사이로 제한한다", () => {
  expect(clampSwipeOffset(-100, 84)).toBe(-84);
  expect(clampSwipeOffset(-20, 84)).toBe(-20);
  expect(clampSwipeOffset(10, 84)).toBe(0);
});
