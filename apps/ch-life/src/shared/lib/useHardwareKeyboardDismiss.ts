import { useEffect } from 'react';
import { NativeModule, requireOptionalNativeModule } from 'expo';
import { Keyboard, Platform } from 'react-native';

declare class HardwareKeyboardModule extends NativeModule<{
  onKeyPress: () => void;
}> {}

/**
 * 물리 키보드로 타이핑이 시작되면 소프트 키보드를 내린다. 포커스는 유지한다(RULE-UI-008).
 * 소프트 키보드는 평소대로 뜨고, 물리 키 입력이 실제로 들어올 때만 반응한다.
 */
export function useHardwareKeyboardDismiss(): void {
  useEffect(() => {
    if (Platform.OS === 'web') return;
    // 모듈이 없는 옛 바이너리(OTA만 받은 설치본)에서는 조용히 기본 동작으로 둔다.
    const hardwareKeyboard =
      requireOptionalNativeModule<HardwareKeyboardModule>('HardwareKeyboard');
    if (!hardwareKeyboard) return;
    const subscription = hardwareKeyboard.addListener('onKeyPress', () => {
      if (!Keyboard.isVisible()) return;
      // 지연 import: shared/lib를 읽는 테스트가 네이티브 모듈을 요구하지 않게 한다.
      void import('react-native-keyboard-controller').then(
        ({ KeyboardController }) =>
          KeyboardController.dismiss({ keepFocus: true }),
      );
    });
    return () => subscription.remove();
  }, []);
}
