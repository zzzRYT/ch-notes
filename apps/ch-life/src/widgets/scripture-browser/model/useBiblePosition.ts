import { useCallback } from "react";
import type { BookCode } from "@/entities/scripture";
import { useSettingsStore } from "@/features/settings/change";

/**
 * 성경 읽기 위치(`"{BookCode} {chapter}"`). 홈 리더·에디터 시트·태블릿 패널이
 * 같은 위치를 이어 본다(RULE-BIBLE-006). 영속화는 settings.json이 맡는다
 * (CONTRACT-SETTINGS-FILE `lastBibleRef`); 포맷을 아는 곳은 이 위젯뿐이다.
 */

export function useBiblePosition(): {
  initialRef: string | null;
  onPositionChange: (book: BookCode, chapter: number) => void;
} {
  const initialRef = useSettingsStore((s) => s.settings.lastBibleRef);
  const setSettings = useSettingsStore((s) => s.setSettings);
  const onPositionChange = useCallback(
    (book: BookCode, chapter: number) => {
      setSettings({ lastBibleRef: `${book} ${chapter}` });
    },
    [setSettings],
  );
  return { initialRef, onPositionChange };
}
