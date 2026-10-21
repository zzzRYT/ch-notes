import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PanResponder, type View } from "react-native";
import {
  IDENTITY,
  centerOn as centered,
  clampTransform,
  toScreen,
  zoomAt,
  type Limits,
  type Size,
  type Transform,
} from "../model/pan-zoom";

const DRAG_SLOP = 6;
const DOUBLE_TAP_MS = 350;

type Touch = { pageX: number; pageY: number };

/**
 * 끌어 이동 · 두 손가락 확대 · 더블탭 확대 · 버튼 확대. 지도 View에 `viewRef`와 `panHandlers`를 단다.
 * 표식을 누르는 탭은 표식이 받고, 표식에서 시작해도 끌면 지도가 가져간다. 탭(더블탭)은 `onTap`으로 받는다.
 * 제스처를 잡은 동안은 부모 스크롤에 넘겨주지 않는다(terminationRequest=false).
 * ponytail: 웹 휠 확대는 없다 — 웹은 ±버튼을 쓴다. 필요하면 View onWheel에서 zoomBy를 부른다.
 */
export function usePanZoom(size: Size, limits: Limits) {
  const [t, setT] = useState<Transform>(IDENTITY);
  const tRef = useRef(t);
  const sizeRef = useRef(size);
  sizeRef.current = size;
  const limitsRef = useRef(limits);
  const raf = useRef(0);
  const viewRef = useRef<View>(null);
  const origin = useRef({ x: 0, y: 0 });

  const apply = useCallback((n: Transform) => {
    cancelAnimationFrame(raf.current);
    tRef.current = clampTransform(n, sizeRef.current, limitsRef.current);
    setT(tRef.current);
  }, []);

  const animateTo = useCallback((n: Transform, ms = 420) => {
    cancelAnimationFrame(raf.current);
    const from = tRef.current;
    const to = clampTransform(n, sizeRef.current, limitsRef.current);
    const t0 = Date.now();
    const step = () => {
      const p = Math.min(1, (Date.now() - t0) / ms);
      const e = 1 - Math.pow(1 - p, 3);
      tRef.current = {
        k: from.k + (to.k - from.k) * e,
        x: from.x + (to.x - from.x) * e,
        y: from.y + (to.y - from.y) * e,
      };
      setT(tRef.current);
      if (p < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  }, []);

  const zoomBy = useCallback(
    (factor: number, px = sizeRef.current.w / 2, py = sizeRef.current.h / 2) =>
      animateTo(zoomAt(tRef.current, factor, px, py, sizeRef.current, limitsRef.current), 260),
    [animateTo],
  );
  const centerOn = useCallback(
    (pt: [number, number], k = tRef.current.k, animated = true) => {
      const n = centered(pt, k, sizeRef.current, limitsRef.current);
      if (animated) animateTo(n);
      else apply(n);
    },
    [animateTo, apply],
  );
  const reset = useCallback(() => animateTo(IDENTITY), [animateTo]);
  // 빈 지형을 누른 탭. 연달아 두 번 누르면 그 지점을 기준으로 2배 확대한다.
  // 표식·버튼의 탭은 그쪽 Pressable이 받으므로 여기 오지 않는다.
  const lastTap = useRef({ at: 0, x: 0, y: 0 });
  const onTap = useCallback(
    (x: number, y: number) => {
      const now = Date.now();
      const prev = lastTap.current;
      if (now - prev.at < DOUBLE_TAP_MS && Math.hypot(x - prev.x, y - prev.y) < 40) {
        lastTap.current = { at: 0, x: 0, y: 0 };
        zoomBy(2, x, y);
      } else lastTap.current = { at: now, x, y };
    },
    [zoomBy],
  );
  const screen = useCallback((pt: [number, number]) => toScreen(tRef.current, pt), []);

  // 크기가 바뀌면(회전·레이아웃) 변환을 새 크기에 다시 맞춘다.
  useEffect(() => {
    apply(tRef.current);
  }, [size.w, size.h, apply]);
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const panHandlers = useMemo(() => {
    let start: { t: Transform; dx: number; dy: number } | null = null;
    let pinch: { d: number; mx: number; my: number; t: Transform } | null = null;
    const rel = (e: Touch) => [e.pageX - origin.current.x, e.pageY - origin.current.y] as const;
    const wantsMove = (
      e: { nativeEvent: { touches: readonly Touch[] } },
      g: { dx: number; dy: number },
    ) => e.nativeEvent.touches.length >= 2 || Math.hypot(g.dx, g.dy) > DRAG_SLOP;

    return PanResponder.create({
      onMoveShouldSetPanResponderCapture: wantsMove,
      onMoveShouldSetPanResponder: wantsMove,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        cancelAnimationFrame(raf.current);
        start = { t: tRef.current, dx: 0, dy: 0 };
        pinch = null;
        viewRef.current?.measureInWindow((x, y) => (origin.current = { x, y }));
      },
      onPanResponderMove: (e, g) => {
        const touches = e.nativeEvent.touches;
        if (touches.length >= 2) {
          const a = rel(touches[0]!);
          const b = rel(touches[1]!);
          const d = Math.hypot(a[0] - b[0], a[1] - b[1]);
          const mx = (a[0] + b[0]) / 2;
          const my = (a[1] + b[1]) / 2;
          if (!pinch) pinch = { d, mx, my, t: tRef.current };
          const k = Math.max(
            limitsRef.current.minK,
            Math.min(limitsRef.current.maxK, pinch.t.k * (d / pinch.d)),
          );
          const r = k / pinch.t.k;
          apply({
            k,
            x: mx - (pinch.mx - pinch.t.x) * r,
            y: my - (pinch.my - pinch.t.y) * r,
          });
          start = null;
          return;
        }
        // 두 손가락에서 한 손가락으로 돌아오면 지금 위치를 기준으로 다시 시작한다.
        if (pinch || !start) {
          pinch = null;
          start = { t: tRef.current, dx: g.dx, dy: g.dy };
        }
        apply({
          ...start.t,
          x: start.t.x + g.dx - start.dx,
          y: start.t.y + g.dy - start.dy,
        });
      },
      onPanResponderRelease: () => {
        start = pinch = null;
      },
      onPanResponderTerminate: () => {
        start = pinch = null;
      },
    }).panHandlers;
  }, [apply]);

  return {
    t,
    screen,
    zoomBy,
    centerOn,
    reset,
    onTap,
    viewRef,
    panHandlers,
    size,
  };
}

export type PanZoom = ReturnType<typeof usePanZoom>;
