import mockReact from "react";
import { Text as mockText, View as mockView } from "react-native";
import { act, create } from "react-test-renderer";
import { BibleReaderPage } from "../BibleReaderPage";

jest.mock("expo-router", () => ({ useRouter: () => ({ back: jest.fn() }) }));
jest.mock("react-native", () => ({ Text: "Text", View: "View" }));

jest.mock("@/shared/ui", () => {
  return {
    AppHeader: ({ title }: { title: string }) =>
      mockReact.createElement(mockText, null, title),
    HeaderBack: () => null,
  };
});

jest.mock("@/widgets/scripture-browser", () => {
  return {
    BibleReader: ({ initialRef }: { initialRef?: string | null }) =>
      mockReact.createElement(
        mockView,
        null,
        mockReact.createElement(mockText, null, initialRef ?? "책 선택"),
      ),
    useBiblePosition: () => ({
      initialRef: "Ezk 1",
      onPositionChange: jest.fn(),
    }),
  };
});

test("홈 성경은 저장된 위치가 있어도 책 목록에서 시작한다", () => {
  let tree: ReturnType<typeof create>;
  act(() => {
    tree = create(mockReact.createElement(BibleReaderPage));
  });

  const text = tree!.root.findAllByType(mockText).map((node) => node.props.children);
  expect(text).toContain("책 선택");
});
