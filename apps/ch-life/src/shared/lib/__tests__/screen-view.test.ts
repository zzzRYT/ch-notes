import { resolveScreenView } from "../screen-view";

describe("resolveScreenView", () => {
  it.each([
    [[], "index", "notes"],
    [["note", "[id]"], "note/[id]", "note_editor"],
    [["bible"], "bible", "bible"],
    [["settings"], "settings", "settings"],
    [["licenses"], "licenses", "licenses"],
  ])("%j → %s / %s", (segments, screen_class, screen_name) => {
    expect(resolveScreenView(segments)).toEqual({ screen_class, screen_name });
  });

  it("매핑에 없는 라우트는 보내지 않는다", () => {
    expect(resolveScreenView(["+not-found"])).toBeNull();
  });
});
