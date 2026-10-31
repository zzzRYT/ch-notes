import type { RefObject } from "react";
import type { NoteEditorHandle } from "../ui/RichNoteEditor";
import type { NoteDraft } from "./useNoteDraft";

/**
 * 에디터에 지금 들어 있는 본문까지 포함해 저장을 끝낸다. 화면을 떠나기 전에
 * 마지막 입력이 저장돼야 할 때 쓴다. 실패하면 그대로 던진다 — 호출자가 화면에 남는다.
 * 읽지 못하면(웹뷰 미준비·무응답) 자동저장이 가진 RN 상태로 저장한다.
 */
export async function saveLive(
  draft: Pick<NoteDraft, "flush">,
  editor: RefObject<NoteEditorHandle | null>,
): Promise<void> {
  const body = await editor.current?.readBody();
  await draft.flush(body ? { body } : undefined);
}
