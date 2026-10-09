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

test("테마 페이지의 다섯 설정은 서로 유지되며 선택 상태에 반영된다", () => {
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
  const { Uniwind } = jest.requireMock('uniwind');
  expect(Uniwind.setTheme).not.toHaveBeenCalled();
  act(() => { tree.unmount(); });
});

test("폰·태블릿 구분 없이 전체 미리보기 없이 작은 견본 행으로 고른다", () => {
  const tree = mount(<ThemeSettingsPage />);
  expect(tree.root.findAllByProps({ testID: 'theme-preview-body' })).toHaveLength(0);
  for (const row of tree.root.findAllByType(SettingRow)) {
    expect(row.props.leading).toBeTruthy();
    expect(row.props.description).toBeUndefined();
    expect(row.props.accessibilityHint).toBeTruthy();
  }
  for (const label of ['종이색', '아주 크게', '명조', '접고 펼치기', '초록']) press(tree, label);
  expect(useSettingsStore.getState().settings).toMatchObject({
    variation: 'paper', fontScale: 1.6, fontFamily: 'serif', blockStyle: 'collapse', accentChoice: '#1f8a5b',
  });
  act(() => { tree.unmount(); });
});

test("설정 화면에는 내보내기 섹션이 없다", () => {
  const tree = mount(<SettingsPage />);
  expect(JSON.stringify(tree.toJSON())).not.toContain("내보내기");
  act(() => { tree.unmount(); });
});
