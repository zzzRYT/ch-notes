import React from "react";
import { act, create } from "react-test-renderer";
import { useScreenTracking } from "../useScreenTracking";
import { logScreenView } from "../log-screen-view";

let mockPathname = "/";
let mockSegments: string[] = [];
jest.mock("expo-router", () => ({
  usePathname: () => mockPathname,
  useSegments: () => [...mockSegments], // 렌더마다 새 배열
}));
jest.mock("../log-screen-view", () => ({ logScreenView: jest.fn() }));

function Probe() {
  useScreenTracking();
  return null;
}

function go(pathname: string, segments: string[], r: ReturnType<typeof create>) {
  mockPathname = pathname;
  mockSegments = segments;
  act(() => r.update(<Probe />));
}

describe("useScreenTracking", () => {
  beforeEach(() => (jest.mocked(logScreenView).mockClear(), (mockPathname = "/"), (mockSegments = [])));

  it("진입·전환마다 한 번, 재렌더는 중복 없이, 노트 ID는 템플릿으로 보낸다", () => {
    let r!: ReturnType<typeof create>;
    act(() => { r = create(<Probe />); });
    go("/", [], r); // 재렌더
    expect(logScreenView).toHaveBeenCalledTimes(1);

    go("/note/abc", ["note", "[id]"], r);
    go("/", [], r); // 뒤로 가기 후 재방문
    expect(jest.mocked(logScreenView).mock.calls.map(([v]) => v.screen_class)).toEqual([
      "index",
      "note/[id]",
      "index",
    ]);
    expect(JSON.stringify(jest.mocked(logScreenView).mock.calls)).not.toContain("abc");
  });
});
