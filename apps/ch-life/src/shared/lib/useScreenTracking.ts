import { useEffect, useRef } from "react";
import { usePathname, useSegments } from "expo-router";
import { logScreenView } from "./log-screen-view";
import { resolveScreenView } from "./screen-view";

/** 루트 레이아웃에서 한 번 호출한다. 경로가 바뀔 때만 screen_view를 보낸다. */
export function useScreenTracking() {
  const pathname = usePathname();
  const segments = useSegments();
  const lastPathname = useRef<string | null>(null);

  useEffect(() => {
    if (lastPathname.current === pathname) return;
    lastPathname.current = pathname;
    const view = resolveScreenView(segments);
    if (view) logScreenView(view);
  }, [pathname, segments]);
}
