import {
  marksAt,
  stripInlineMarks,
  toggleInlineMark,
  tokenizeInlineMarks,
} from "../inline-marks";

describe("stripInlineMarks", () => {
  test("removes bold, italic, and underline delimiters", () => {
    expect(stripInlineMarks("a **b** _c_ ++d++")).toBe("a b c d");
  });

  test("leaves plain text untouched", () => {
    expect(stripInlineMarks("창세기 1:1 태초에")).toBe("창세기 1:1 태초에");
  });
});

describe("tokenizeInlineMarks", () => {
  const joined = (s: string) =>
    tokenizeInlineMarks(s)
      .map((r) => r.text)
      .join("");

  test("runs concatenate back to the input (display == storage)", () => {
    for (const s of ["a **b** _c_ ++d++", "**", "a_b", "****", "**x _y_ z**"]) {
      expect(joined(s)).toBe(s);
    }
  });

  test("paired delimiters style the text between them; an opener carries its mark, a closer does not", () => {
    expect(tokenizeInlineMarks("a **b** c")).toEqual([
      { text: "a ", marks: [], delimiter: false },
      { text: "**", marks: ["bold"], delimiter: true },
      { text: "b", marks: ["bold"], delimiter: false },
      { text: "**", marks: [], delimiter: true },
      { text: " c", marks: [], delimiter: false },
    ]);
  });

  test("nests different marks", () => {
    const styled = tokenizeInlineMarks("**x _y_**").filter((r) => !r.delimiter);
    expect(styled).toEqual([
      { text: "x ", marks: ["bold"], delimiter: false },
      { text: "y", marks: ["bold", "italic"], delimiter: false },
    ]);
  });

  test("an unpaired delimiter is plain text", () => {
    expect(tokenizeInlineMarks("snake_case")).toEqual([
      { text: "snake_case", marks: [], delimiter: false },
    ]);
  });
});

describe("marksAt", () => {
  test("inside, at the end of, and outside a bold run", () => {
    expect(marksAt("a **bc** d", 5)).toEqual(["bold"]);
    expect(marksAt("a **bc** d", 6)).toEqual(["bold"]);
    expect(marksAt("a **bc** d", 1)).toEqual([]);
    expect(marksAt("a **bc** d", 9)).toEqual([]);
  });

  test("inside an empty pair", () => {
    expect(marksAt("****", 2)).toEqual(["bold"]);
  });
});

describe("toggleInlineMark", () => {
  test("wraps a selection and keeps it selected", () => {
    expect(toggleInlineMark("say hi now", 4, 6, "bold")).toEqual({
      text: "say **hi** now",
      start: 6,
      end: 8,
    });
    expect(toggleInlineMark("hi", 0, 2, "underline").text).toBe("++hi++");
    expect(toggleInlineMark("hi", 0, 2, "italic").text).toBe("_hi_");
  });

  test("unwraps when the selection sits just inside the delimiters", () => {
    expect(toggleInlineMark("say **hi** now", 6, 8, "bold")).toEqual({
      text: "say hi now",
      start: 4,
      end: 6,
    });
  });

  test("unwraps when the selection includes the delimiters", () => {
    expect(toggleInlineMark("say **hi** now", 4, 10, "bold")).toEqual({
      text: "say hi now",
      start: 4,
      end: 6,
    });
  });

  test("collapsed caret gets an empty pair to type into, and a second tap removes it", () => {
    const on = toggleInlineMark("ab", 1, 1, "bold");
    expect(on).toEqual({ text: "a****b", start: 3, end: 3 });
    expect(toggleInlineMark(on.text, on.start, on.end, "bold")).toEqual({
      text: "ab",
      start: 1,
      end: 1,
    });
  });

  test("caret before an active closer steps past it instead of nesting", () => {
    expect(toggleInlineMark("**ab** c", 4, 4, "bold")).toEqual({
      text: "**ab** c",
      start: 6,
      end: 6,
    });
  });
});
