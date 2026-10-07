import React from "react";
import { act, create } from "react-test-renderer";
import { DEFAULT_SETTINGS, useSettingsStore } from "@/features/settings/change";
import { SettingsPage } from "../SettingsPage";

jest.mock("@/features/settings/change", () =>
  jest.requireActual("@/features/settings/change/model/settings-store"),
);
jest.mock("@/features/support/contact", () => ({
  useContactSupport: () => ({ openContact: jest.fn(), showAddressFallback: false, supportEmail: "test@example.com" }),
}));
jest.mock("expo-router", () => ({ useRouter: () => ({ back: jest.fn(), push: jest.fn() }) }));
jest.mock("uniwind", () => ({ Uniwind: { setTheme: jest.fn(), updateCSSVariables: jest.fn() } }));
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

test("공통 UI로 선택한 다섯 설정 축이 서로의 값을 유지하며 스토어에 반영된다", () => {
  useSettingsStore.setState({ settings: { ...DEFAULT_SETTINGS } });
  let tree!: ReturnType<typeof create>;
  act(() => { tree = create(<SettingsPage />); });

  for (const label of [
    "A · 미니멀 — 깨끗한 화이트 · 파랑",
    "아주 크게",
    "Mono",
    "인용바",
    "녹색 (말씀)",
  ]) {
    const button = tree.root.findAllByProps({ accessibilityLabel: label }).find((node) => node.props.accessibilityState);
    expect(button).toBeDefined();
    act(() => { button!.props.onPress(); });
    const selected = tree.root.findAllByProps({ accessibilityLabel: label }).find((node) => node.props.accessibilityState);
    expect(selected?.props.accessibilityState.selected).toBe(true);
  }
  expect(useSettingsStore.getState().settings).toEqual({
    ...DEFAULT_SETTINGS,
    variation: "minimal",
    fontScale: 1.6,
    fontFamily: "mono",
    blockStyle: "quote",
    accentChoice: "#1f8a5b",
  });
  act(() => { tree.unmount(); });
  useSettingsStore.setState({ settings: { ...DEFAULT_SETTINGS } });
});
