import React from "react";
import { act, create } from "react-test-renderer";
import { ThemeProvider, type ThemeSettings } from "../ThemeProvider";

// uniwind 런타임은 Metro가 CSS를 컴파일해 넣어야 동작한다. 여기서는 "ThemeProvider가
// 무엇을 넘기는가"만 본다 — 테마 이름 = variation, accent 덮어쓰기, ×fontScale.
jest.mock("uniwind", () => ({
  Uniwind: { setTheme: jest.fn(), updateCSSVariables: jest.fn() },
}));
const { setTheme, updateCSSVariables } = (
  jest.requireMock("uniwind") as {
    Uniwind: { setTheme: jest.Mock; updateCSSVariables: jest.Mock };
  }
).Uniwind;

const BASE: ThemeSettings = {
  fontScale: 1.2,
  variation: "paper",
  blockStyle: "default",
  fontFamily: "sans",
  accentChoice: "default",
};

function mount(settings: ThemeSettings) {
  let tree!: ReturnType<typeof create>;
  act(() => {
    tree = create(<ThemeProvider settings={settings}>{null}</ThemeProvider>);
  });
  return tree;
}

beforeEach(() => {
  setTheme.mockClear();
  updateCSSVariables.mockClear();
});

test("variation이 uniwind 테마 이름이 되고, 팔레트 accent와 ×fontScale 타입 스케일을 넘긴다", () => {
  mount(BASE);
  expect(setTheme).toHaveBeenLastCalledWith("paper");
  expect(updateCSSVariables).toHaveBeenLastCalledWith("paper", {
    "--color-accent": "#b15c2e",
    "--color-accent-soft": "rgba(177,92,46,0.09)",
    "--font-body": "Pretendard, -apple-system, system-ui, sans-serif",
    "--text-display": 36,
    "--text-title": 24,
    "--text-body-large": 20,
    "--text-body": 18,
    "--text-label": 16,
    "--text-caption": 13,
  });
});

test("accentChoice를 고르면 accent만 바뀌고 accent-soft는 8% 알파로 파생된다", () => {
  const tree = mount(BASE);
  act(() => {
    tree.update(
      <ThemeProvider settings={{ ...BASE, accentChoice: "#1e6fd9" }}>
        {null}
      </ThemeProvider>,
    );
  });
  const [theme, vars] = updateCSSVariables.mock.lastCall as [string, Record<string, unknown>];
  expect(theme).toBe("paper");
  expect(vars["--color-accent"]).toBe("#1e6fd9");
  expect(vars["--color-accent-soft"]).toBe("rgba(30, 111, 217, 0.08)");
});

test("variation을 바꾸면 새 테마 이름으로 다시 넘긴다", () => {
  const tree = mount(BASE);
  act(() => {
    tree.update(
      <ThemeProvider settings={{ ...BASE, variation: "dark" }}>{null}</ThemeProvider>,
    );
  });
  expect(setTheme).toHaveBeenLastCalledWith("dark");
  expect(updateCSSVariables.mock.lastCall?.[0]).toBe("dark");
});
