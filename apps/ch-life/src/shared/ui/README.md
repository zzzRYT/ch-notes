# 공통 조작 UI

`@/shared/ui`에서 가져온다. Button·IconButton은 Atom, SettingRow는 라벨과 설명을 묶는 Molecule이며 현재 앱에 연결된 `code` 컴포넌트다(ADR-0023).

```tsx
import { Button, IconButton, SettingRow } from "@/shared/ui";
import { ChevronLeft } from "lucide-react-native";

<Button label="크게" selected={fontScale === 1.2} onPress={() => setSettings({ fontScale: 1.2 })} />
<Button label="사용할 수 없음" disabled onPress={() => {}} />
<IconButton icon={ChevronLeft} label="뒤로" onPress={() => router.back()} />
<SettingRow label="종이" description="크림 톤 · 갈색" selected={variation === "paper"} onPress={() => setSettings({ variation: "paper" })} />
<SettingRow label="출처 및 라이선스" marker="›" onPress={() => router.push("/licenses")} />
```

- 기본·눌림·선택·비활성 상태는 컴포넌트가 처리한다. `selected`와 `disabled`는 접근성 상태에도 전달한다. 비활성일 때는 Pressable이 입력을 받지 않는다.
- `Button.leading`은 강조색 견본 같은 부가 표시에 쓴다. 견본의 hex는 사용자 데이터라 inline style로 전달한다.
- `SettingRow`는 `selected`를 넘기면 선택 카드, 생략하면 구분선이 있는 이동 행이다. 외부 링크는 `accessibilityRole="link"`를 전달한다.
- 라벨은 큰 글씨에서 줄바꿈하며, 행의 체크 표시·아이콘은 라벨 옆에 별도로 둔다. 색과 텍스트 크기는 uniwind 토큰을 따른다.
- `HeaderIconButton`은 기존 호출처 호환을 위한 `IconButton` 별칭이다.

## 실기기 검수 (#64)

폰·태블릿에서 fontScale 1.6으로 minimal/paper/focus/dark를 각각 선택한다. 모든 설정 영역을 스크롤해 라벨 잘림·아이콘 겹침·견본 표시와 선택 상태를 확인한다. 글꼴·블록·강조색을 변경하고 앱 재시작 후 저장값을 확인한다. 변경 전후 캡처를 PR에 첨부한다.
