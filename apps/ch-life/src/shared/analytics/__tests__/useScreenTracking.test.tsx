import React from "react";
import { Platform } from "react-native";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { useScreenTracking } from "../useScreenTracking";
import { getAnalytics, logScreenView } from "@react-native-firebase/analytics";
import firebaseConfig from "../../../../firebase.json";

let mockRoute: { key: string; name: string; params?: object } | undefined;
const mockListeners = { ready: new Set<() => void>(), state: new Set<() => void>() };
const mockNavigationRef = {
  isReady: () => !!mockRoute,
  getCurrentRoute: () => mockRoute,
  addListener: (event: "ready" | "state", listener: () => void) => {
    mockListeners[event].add(listener);
    return () => mockListeners[event].delete(listener);
  },
};
jest.mock("expo-router", () => ({
  useNavigationContainerRef: () => mockNavigationRef,
}));
jest.mock("@react-native-firebase/analytics", () => ({
  getAnalytics: jest.fn(() => "analytics"),
  logScreenView: jest.fn(() => Promise.resolve()),
}));

function Tracker() {
  useScreenTracking();
  return null;
}

let tree: ReactTestRenderer;
function enter(name: string, key = name, params?: object) {
  mockRoute = { name, key, params };
  act(() => mockListeners.state.forEach((listener) => listener()));
}

beforeEach(() => {
  jest.clearAllMocks();
  mockRoute = undefined;
  Platform.OS = "ios";
  act(() => { tree = create(<Tracker />); });
});
afterEach(() => { act(() => tree.unmount()); });

test.each(["ios", "android"] as const)("%s에서 직접 진입한 5개 라우트를 고정 이름으로 전송한다", (platform) => {
  Platform.OS = platform;
  for (const [name, screenName] of [
    ["index", "notes"], ["note/[id]", "note_editor"], ["bible", "bible"],
    ["settings", "settings"], ["licenses", "licenses"],
  ] as const) {
    enter(name);
    expect(logScreenView).toHaveBeenLastCalledWith("analytics", {
      screen_class: name, screen_name: screenName,
    });
  }
  expect(logScreenView).toHaveBeenCalledTimes(5);
});

test("라우터 준비 전에는 조회를 기록하지 않는다", () => {
  expect(logScreenView).not.toHaveBeenCalled();
});

test("네이티브 자동 화면 수집을 빌드 설정에서 비활성화한다", () => {
  expect(firebaseConfig["react-native"].google_analytics_automatic_screen_reporting_enabled).toBe(false);
});

test("재렌더·쿼리 변경·태블릿 패널 조작은 추가 조회가 아니다", () => {
  enter("index", "home");
  enter("index", "home", { query: "사용자 검색어", panel: "bible" });
  act(() => tree.update(<Tracker />));
  expect(logScreenView).toHaveBeenCalledTimes(1);
});

test("뒤로 가기와 재방문은 기존 키로 돌아와도 다시 기록한다", () => {
  enter("index", "home");
  enter("settings", "settings-1");
  enter("index", "home");
  enter("settings", "settings-2");
  expect(logScreenView).toHaveBeenCalledTimes(4);
});

test("같은 경로를 새 화면으로 push하면 기록한다", () => {
  enter("bible", "bible-1");
  enter("bible", "bible-2");
  expect(logScreenView).toHaveBeenCalledTimes(2);
});

test("노트 간 이동은 같은 클래스로 묶고 ID와 콘텐츠를 보내지 않는다", () => {
  enter("note/[id]", "editor-1", { id: "private-1", title: "제목", query: "검색어" });
  enter("note/[id]", "editor-2", { id: "private-2" });
  enter("note/[id]", "editor-2", { id: "private-3" });
  expect(jest.mocked(logScreenView).mock.calls).toEqual(Array(3).fill([
    "analytics", { screen_class: "note/[id]", screen_name: "note_editor" },
  ]));
});

test("알 수 없는 라우트와 웹은 전송하지 않는다", () => {
  enter("+not-found", "unknown");
  act(() => tree.unmount());
  Platform.OS = "web";
  act(() => { tree = create(<Tracker />); });
  enter("index", "home");
  expect(getAnalytics).not.toHaveBeenCalled();
});

test("SDK 실패가 화면 렌더를 중단하거나 사용자 데이터를 출력하지 않는다", async () => {
  const warning = jest.spyOn(console, "warn").mockImplementation(() => {});
  jest.mocked(logScreenView).mockRejectedValueOnce(new Error("SDK unavailable"));
  enter("index", "home");
  await act(async () => {});
  expect(warning).toHaveBeenCalledWith("Screen view tracking failed");
  jest.mocked(getAnalytics).mockImplementationOnce(() => { throw new Error("App unavailable"); });
  enter("bible");
  expect(warning).toHaveBeenCalledTimes(2);
  warning.mockRestore();
});


test("ready에서 최초 화면을 한 번 기록하고 상태 이벤트와 중복하지 않는다", () => {
  mockRoute = { key: "home", name: "index" };
  act(() => mockListeners.ready.forEach((listener) => listener()));
  enter("index", "home");
  expect(logScreenView).toHaveBeenCalledTimes(1);
});

test("언마운트하면 ready와 state 구독을 해제한다", () => {
  act(() => tree.unmount());
  expect(mockListeners.ready.size).toBe(0);
  expect(mockListeners.state.size).toBe(0);
});
