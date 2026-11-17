import React from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import {
  NavigationContainer,
  createNavigationContainerRef,
  createNavigatorFactory,
  StackActions,
  StackRouter,
  useNavigationBuilder,
  type ParamListBase,
} from "@react-navigation/native";
import { logScreenView } from "@react-native-firebase/analytics";
import { useScreenTracking } from "../useScreenTracking";

let mockNavigation = createNavigationContainerRef<ParamListBase>();
jest.mock("expo-router", () => ({
  useNavigationContainerRef: () => mockNavigation,
}));
jest.mock("@react-native-firebase/analytics", () => ({
  getAnalytics: () => "analytics",
  logScreenView: jest.fn(() => Promise.resolve()),
}));

function Navigator(props: Parameters<typeof useNavigationBuilder>[1]) {
  const { state, descriptors, NavigationContent } = useNavigationBuilder(StackRouter, props);
  return (
    <NavigationContent>
      {descriptors[state.routes[state.index]!.key]!.render()}
    </NavigationContent>
  );
}
const Stack = createNavigatorFactory(Navigator)();
function Screen() { return null; }
function RootLayout() {
  useScreenTracking();
  return (
    <Stack.Navigator initialRouteName="index">
      <Stack.Screen name="index" component={Screen} />
      <Stack.Screen name="note/[id]" component={Screen} />
      <Stack.Screen name="bible" component={Screen} />
      <Stack.Screen name="settings" component={Screen} />
      <Stack.Screen name="licenses" component={Screen} />
    </Stack.Navigator>
  );
}

test("내부 루트 아래의 활성 화면과 재방문·같은 경로 push를 상태 이벤트로 추적한다", async () => {
  mockNavigation = createNavigationContainerRef<ParamListBase>();
  let tree: ReactTestRenderer;
  await act(async () => {
    tree = create(
      <NavigationContainer ref={mockNavigation}>
        <Stack.Navigator>
          <Stack.Screen name="__root" component={RootLayout} />
        </Stack.Navigator>
      </NavigationContainer>,
    );
  });
  expect(logScreenView).toHaveBeenCalledTimes(1);
  expect(logScreenView).toHaveBeenLastCalledWith("analytics", {
    screen_class: "index", screen_name: "notes",
  });
  await act(async () => mockNavigation.navigate("settings"));
  expect(logScreenView).toHaveBeenLastCalledWith("analytics", {
    screen_class: "settings", screen_name: "settings",
  });
  await act(async () => mockNavigation.goBack());
  await act(async () => mockNavigation.dispatch(StackActions.push("index")));
  expect(logScreenView).toHaveBeenCalledTimes(4);
  await act(async () => mockNavigation.navigate("note/[id]", { id: "private-id", query: "private-query" }));
  expect(logScreenView).toHaveBeenLastCalledWith("analytics", {
    screen_class: "note/[id]", screen_name: "note_editor",
  });
  await act(async () => mockNavigation.setParams({ query: "changed-query" }));
  expect(logScreenView).toHaveBeenCalledTimes(5);
  await act(async () => tree.unmount());
});
