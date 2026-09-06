import { useEffect, useRef } from "react";
import { useAppStore } from "./app-store";
import { loadSettings, saveSettings } from "./settings-persist";

/**
 * `settings.json` ↔ 스토어를 잇는 부팅 배선(`RULE-SET-006`).
 *
 * 루트 레이아웃에서 한 번만 부른다. 레이아웃이 "앱이 뜰 때 해야 하는 일"을
 * 직접 알지 않게 하려고 떼어 뒀다 — 부팅 관심사는 자기 모듈 옆에 훅으로 두고,
 * 레이아웃에는 호출 한 줄만 남긴다.
 *
 * **로드가 끝나기 전에는 저장하지 않는다.** 그러지 않으면 기본값이 파일을
 * 덮어써 저장된 설정이 사라진다. 저장 실패는 콘솔 경고로 끝내고 사용자에게
 * 알리지 않는다(`POL-A11Y-001`의 "조용함").
 */
export function useSettingsPersistence(): void {
  const loadedRef = useRef(false);

  useEffect(() => {
    loadSettings()
      .then((s) => {
        if (s) useAppStore.getState().setSettings(s);
      })
      .finally(() => {
        loadedRef.current = true;
        // 기본값과 저장값을 가르는 신호. 파일을 읽기 전에 화면을 띄우는
        // 기능(예: StoreUpdateDialog)이 기본값을 저장값으로 오인하지 않게 한다.
        useAppStore.getState().markSettingsLoaded();
      });
  }, []);

  useEffect(() => {
    const unsub = useAppStore.subscribe((state, prev) => {
      if (!loadedRef.current) return;
      if (state.settings === prev.settings) return;
      saveSettings(state.settings).catch((e) =>
        console.warn("saveSettings failed", e),
      );
    });
    return () => unsub();
  }, []);
}
