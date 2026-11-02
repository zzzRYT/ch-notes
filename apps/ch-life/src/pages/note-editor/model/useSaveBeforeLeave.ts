import { useEffect, useRef, type RefObject } from "react";
import { useNavigation } from "expo-router";

/**
 * 화면이 제거되기 전(헤더 버튼·기기 뒤로·제스처 모두)에 `save`를 기다린다.
 * 성공하면 원래 이동을 이어 가고, 실패하면 이 화면에 남는다. 자동저장은 화면을 떠날 때
 * 대기 타이머를 취소하므로 이 훅이 없으면 마지막 입력이 사라질 수 있다.
 * `skip.current`가 true면(삭제 뒤처럼 저장하면 안 될 때) 가로채지 않는다.
 */
export function useSaveBeforeLeave(
  save: () => Promise<void>,
  onFail: (error: unknown) => void,
  skip: RefObject<boolean>,
) {
  const navigation = useNavigation();
  const latest = useRef({ save, onFail });
  latest.current = { save, onFail };
  const busy = useRef(false);
  const saved = useRef(false);

  useEffect(
    () =>
      navigation.addListener("beforeRemove", (e) => {
        if (skip.current || saved.current) return;
        e.preventDefault();
        // 저장 중에 또 뒤로 가기를 눌러도 한 번만 저장하고 이동한다.
        if (busy.current) return;
        busy.current = true;
        latest.current
          .save()
          .then(() => {
            saved.current = true;
            try {
              navigation.dispatch(e.data.action);
            } finally {
              saved.current = false;
            }
          })
          .catch((error) => latest.current.onFail(error))
          .finally(() => {
            busy.current = false;
          });
      }),
    [navigation, skip],
  );
}
