import React from "react";
import { Platform, TextInput } from "react-native";
import { act, create, type ReactTestInstance } from "react-test-renderer";
import { SermonMetaHeader, type SermonMetaHeaderProps } from "../SermonMetaHeader";

jest.mock("@/shared/ui", () => ({
  useTheme: () => ({ colors: { accent: "#b15c2e" }, fontScale: 1 }),
  scaled: (n: number) => n,
}));
jest.mock("lucide-react-native", () => ({ Calendar: () => null }));
jest.mock("@/features/scripture/insert", () => ({
  validateScripture: () => ({ valid: false }),
}));
jest.mock("../ScripturePreviewModal", () => ({ ScripturePreviewModal: () => null }));

type PickerProps = {
  visible: boolean;
  onSelect: (ymd: string) => void;
  onClose: () => void;
  onDismissed?: () => void;
};
let mockPicker: PickerProps;
jest.mock("../DatePickerModal", () => ({
  DatePickerModal: (props: PickerProps) => {
    mockPicker = props;
    return null;
  },
}));

const LABELS = ["설교 제목", "설교 날짜", "설교자", "장소", "생명양식 본문"] as const;

function mount(overrides: Partial<SermonMetaHeaderProps> = {}) {
  const props: SermonMetaHeaderProps = {
    title: null,
    sermonDate: null,
    preacher: null,
    location: null,
    scripture: null,
    onChangeTitle: jest.fn(),
    onChangeSermonDate: jest.fn(),
    onChangePreacher: jest.fn(),
    onChangeLocation: jest.fn(),
    onChangeScripture: jest.fn(),
    onSubmitLast: jest.fn(),
    ...overrides,
  };
  let tree!: ReturnType<typeof create>;
  act(() => {
    tree = create(<SermonMetaHeader {...props} />);
  });
  return { tree, props };
}

function input(tree: ReturnType<typeof create>, label: string): ReactTestInstance {
  return tree.root.findAll(
    (n) => n.type === TextInput && n.props.accessibilityLabel === label,
  )[0]!;
}

function calendarButton(tree: ReturnType<typeof create>): ReactTestInstance {
  return tree.root.findAll(
    (n) =>
      n.props.accessibilityLabel === "달력에서 날짜 선택" &&
      typeof n.props.onPress === "function",
  )[0]!;
}

// jest-expo의 TextInput 목은 focus를 모든 인스턴스가 공유하는 jest.fn으로 둔다 —
// 어느 칸이 포커스를 받았는지는 호출의 this(mock.contexts)로 가른다.
const focusMock = (tree: ReturnType<typeof create>) =>
  input(tree, "설교 제목").instance.focus as jest.Mock;
const focusCount = (tree: ReturnType<typeof create>, label: string) =>
  focusMock(tree).mock.contexts.filter((c) => c === input(tree, label).instance).length;

beforeEach(() => {
  (TextInput.prototype as unknown as { focus?: jest.Mock }).focus?.mockClear();
});

describe("Return 키 이동 (RULE-EDIT-011)", () => {
  it("제목 → 날짜 → 설교자 → 장소 → 생명양식 순으로 포커스를 넘기고, 마지막은 본문으로 넘긴다", () => {
    const { tree, props } = mount();
    LABELS.slice(0, -1).forEach((from, i) => {
      act(() => input(tree, from).props.onSubmitEditing());
      expect(focusCount(tree, LABELS[i + 1]!)).toBe(1);
    });
    expect(props.onSubmitLast).not.toHaveBeenCalled();
    act(() => input(tree, LABELS[LABELS.length - 1]!).props.onSubmitEditing());
    expect(props.onSubmitLast).toHaveBeenCalledTimes(1);
  });
});

describe("달력 버튼 — 키보드 정지점", () => {
  it("포커스를 받을 수 있는 버튼이다", () => {
    const { tree } = mount();
    expect(calendarButton(tree).props.focusable).toBe(true);
    expect(calendarButton(tree).props.accessibilityRole).toBe("button");
  });

  it("키보드로 포커스한 채 열었다가 닫으면 날짜 칸으로 포커스가 돌아온다 (iOS: 모달이 내려간 뒤)", () => {
    const { tree } = mount();
    act(() => calendarButton(tree).props.onFocus());
    act(() => calendarButton(tree).props.onPress());
    expect(mockPicker.visible).toBe(true);

    act(() => mockPicker.onClose());
    expect(focusCount(tree, "설교 날짜")).toBe(0);
    act(() => mockPicker.onDismissed?.());
    expect(focusCount(tree, "설교 날짜")).toBe(1);
  });

  it("Android는 닫히자마자(다음 틱) 날짜 칸으로 돌아온다", () => {
    jest.useFakeTimers();
    const original = Platform.OS;
    Platform.OS = "android";
    try {
      const { tree } = mount();
      act(() => calendarButton(tree).props.onFocus());
      act(() => calendarButton(tree).props.onPress());
      act(() => mockPicker.onSelect("2026-06-07"));
      act(() => mockPicker.onClose());
      act(() => {
        jest.runAllTimers();
      });
      expect(focusCount(tree, "설교 날짜")).toBe(1);
    } finally {
      Platform.OS = original;
      jest.useRealTimers();
    }
  });

  it("손가락으로 열면 포커스를 옮기지 않는다 (소프트 키보드가 뜨지 않게)", () => {
    const { tree } = mount();
    act(() => calendarButton(tree).props.onFocus());
    act(() => calendarButton(tree).props.onPressIn());
    act(() => calendarButton(tree).props.onPress());
    act(() => mockPicker.onClose());
    act(() => mockPicker.onDismissed?.());
    expect(focusCount(tree, "설교 날짜")).toBe(0);
  });

  it("포커스가 빠져나간 뒤에 열면(접근성 클릭 등) 포커스를 옮기지 않는다", () => {
    const { tree } = mount();
    act(() => calendarButton(tree).props.onFocus());
    act(() => calendarButton(tree).props.onBlur());
    act(() => calendarButton(tree).props.onPress());
    act(() => mockPicker.onClose());
    act(() => mockPicker.onDismissed?.());
    expect(focusCount(tree, "설교 날짜")).toBe(0);
  });

  it("달력에서 고른 날짜는 저장하고 날짜 칸에 반영한다", () => {
    const { tree, props } = mount();
    act(() => calendarButton(tree).props.onPress());
    act(() => mockPicker.onSelect("2026-06-07"));
    expect(props.onChangeSermonDate).toHaveBeenCalledWith("2026-06-07");
    expect(input(tree, "설교 날짜").props.value).toBe("2026-06-07");
  });
});
