import { stripInlineMarks } from "../inlineMarks";

describe("stripInlineMarks", () => {
  test("removes bold, italic, and underline delimiters", () => {
    expect(stripInlineMarks("a **b** _c_ ++d++")).toBe("a b c d");
  });

  test("leaves plain text untouched", () => {
    expect(stripInlineMarks("창세기 1:1 태초에")).toBe("창세기 1:1 태초에");
  });
});
