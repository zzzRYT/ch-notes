import React from "react";
import { act, create } from "react-test-renderer";
import { DEFAULT_SETTINGS, useSettingsStore } from "@/features/settings/change";
import { Button, SettingRow } from "@/shared/ui";
import { SettingsPage } from "../SettingsPage";
import { ThemeSettingsPage } from "../ThemeSettingsPage";

jest.mock("@/features/settings/change", () =>
  jest.requireActual("@/features/settings/change/model/settings-store"),
);
jest.mock("@/features/support/contact", () => ({
  useContactSupport: () => ({ openContact: jest.fn(), showAddressFallback: false, supportEmail: "test@example.com" }),
}));
const mockPush = jest.fn();
jest.mock("expo-router", () => ({ useRouter: () => ({ back: jest.fn(), push: mockPush }) }));
jest.mock("uniwind", () => ({ Uniwind: { setTheme: jest.fn(), updateCSSVariables: jest.fn() } }));
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

beforeEach(() => {
  useSettingsStore.setState({ settings: { ...DEFAULT_SETTINGS } });
  mockPush.mockClear();
});
afterEach(() => act(() => { useSettingsStore.setState({ settings: { ...DEFAULT_SETTINGS } }); }));

function mount(page: React.ReactElement) {
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(page); });
  return tree;
}

function press(tree: ReturnType<typeof create>, label: string) {
  const button = tree.root.findAllByProps({ accessibilityLabel: label })
    .find((node) => node.props.accessibilityState);
  expect(button).toBeDefined();
  act(() => { button!.props.onPress(); });
}

test("설정에서 테마 변경 페이지로 이동하고 기존 디자인 선택지는 숨긴다", () => {
  const tree = mount(<SettingsPage />);
  press(tree, "테마 변경");
  expect(mockPush).toHaveBeenCalledWith('/settings/theme');
  expect(tree.root.findAllByProps({ accessibilityLabel: "밝은 화면" })).toHaveLength(0);
  expect(useSettingsStore.getState().settings).toEqual(DEFAULT_SETTINGS);
  act(() => { tree.unmount(); });
});

test("테마 페이지의 다섯 설정은 서로 유지되며 선택 상태와 미리보기에 반영된다", () => {
  const tree = mount(<ThemeSettingsPage />);
  for (const label of ["밝은 화면", "아주 크게", "고정폭", "왼쪽 선", "초록"]) {
    press(tree, label);
    const selected = tree.root.findAllByProps({ accessibilityLabel: label })
      .find((node) => node.props.accessibilityState);
    expect(selected?.props.accessibilityState.selected).toBe(true);
  }
  expect(useSettingsStore.getState().settings).toEqual({
    ...DEFAULT_SETTINGS, variation: "minimal", fontScale: 1.6,
    fontFamily: "mono", blockStyle: "quote", accentChoice: "#1f8a5b",
  });
  const body = tree.root.findAllByProps({ testID: 'theme-preview-body' })[0];
  expect(body!.props.style.fontSize).toBe(27);
  const { Uniwind } = jest.requireMock('uniwind');
  expect(Uniwind.setTheme).not.toHaveBeenCalled();
  act(() => { tree.unmount(); });
});

test("배경을 바꿔도 명시한 강조색과 인용 모양이 유지되고 기본값으로 돌아갈 수 있다", () => {
  const tree = mount(<ThemeSettingsPage />);
  press(tree, "초록");
  press(tree, "카드");
  press(tree, "어두운 화면");
  expect(useSettingsStore.getState().settings).toMatchObject({
    variation: 'dark', accentChoice: '#1f8a5b', blockStyle: 'card',
  });
  const defaults = [...tree.root.findAllByType(Button), ...tree.root.findAllByType(SettingRow)]
    .filter((node) => node.props.label === '테마에 맞추기');
  expect(defaults).toHaveLength(2);
  act(() => { defaults.forEach((node) => node.props.onPress()); });
  expect(useSettingsStore.getState().settings).toMatchObject({ accentChoice: 'default', blockStyle: 'default' });
  act(() => { tree.unmount(); });
});


test("예시 구절을 접고 펼치는 조작은 저장된 설정을 바꾸지 않는다", () => {
  const tree = mount(<ThemeSettingsPage />);
  press(tree, "미리보기 구절 접기");
  expect(tree.root.findAllByProps({ accessibilityLabel: "미리보기 구절 펼치기" }).length).toBeGreaterThan(0);
  expect(useSettingsStore.getState().settings).toEqual(DEFAULT_SETTINGS);
  press(tree, "미리보기 구절 펼치기");
  expect(useSettingsStore.getState().settings).toEqual(DEFAULT_SETTINGS);
  act(() => { tree.unmount(); });
});
