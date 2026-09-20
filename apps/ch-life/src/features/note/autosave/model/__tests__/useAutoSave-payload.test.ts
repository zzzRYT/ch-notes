import { buildSavePayload } from "../useAutoSave";

describe("buildSavePayload", () => {
  it("body에서 citedRefs를 추출하고 모든 메타 필드를 포함한다", () => {
    const payload = buildSavePayload({
      title: "주일설교",
      body: [
        { type: "quote", ref: "Col 3:20", verses: [], status: "loaded" },
        { type: "paragraph", text: "메모" },
      ],
      sermonDate: "2026-05-24",
      preacher: "홍길동",
      location: "본당",
      scripture: "요 3:16",
    });
    expect(payload).toEqual({
      title: "주일설교",
      body: expect.any(Array),
      citedRefs: ["Col 3:20"],
      sermonDate: "2026-05-24",
      preacher: "홍길동",
      location: "본당",
      scripture: "요 3:16",
    });
  });
});
