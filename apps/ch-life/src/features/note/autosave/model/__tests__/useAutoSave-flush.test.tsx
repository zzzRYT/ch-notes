import React from "react";
import { act, create } from "react-test-renderer";
import type { BlockNode } from "@/entities/note";
import { useAutoSave, type AutoSaveHandle } from "../useAutoSave";

const para = (text: string): BlockNode[] => [{ type: "paragraph", text }];
let handle: AutoSaveHandle;
function Probe(p: { body: BlockNode[]; save: (patch: unknown) => Promise<void>; enabled?: boolean }) {
  handle = useAutoSave({
    title: "t", body: p.body, sermonDate: null, preacher: null, location: null, scripture: null,
    save: p.save as never, enabled: p.enabled,
  });
  return null;
}

describe("useAutoSave.flush", () => {
  it("live 본문을 주면 화면 상태 대신 그 본문을 저장한다(웹뷰가 아직 못 보낸 입력)", async () => {
    const save = jest.fn().mockResolvedValue(undefined);
    act(() => { create(<Probe body={para("옛")} save={save} />); });
    await act(async () => { await handle.flush({ body: para("마지막 입력") }); });
    expect(save).toHaveBeenCalledTimes(1);
    expect(save.mock.calls[0][0].body).toEqual(para("마지막 입력"));
  });

  it("live가 없으면 화면 상태를 저장하고, 비활성(삭제 중)이면 저장하지 않는다", async () => {
    const save = jest.fn().mockResolvedValue(undefined);
    let r!: ReturnType<typeof create>;
    act(() => { r = create(<Probe body={para("상태")} save={save} />); });
    await act(async () => { await handle.flush(); });
    expect(save.mock.calls[0][0].body).toEqual(para("상태"));

    save.mockClear();
    act(() => r.update(<Probe body={para("상태")} save={save} enabled={false} />));
    await act(async () => { await handle.flush({ body: para("x") }); });
    expect(save).not.toHaveBeenCalled();
  });
});
