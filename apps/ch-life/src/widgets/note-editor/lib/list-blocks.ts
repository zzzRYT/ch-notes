import type { BlockNode } from "@/entities/note";

// 구조가 바뀌는 본문 편집의 결과 — 새 본문과 캐럿을 놓을 블록.
export type BodyEdit = { body: BlockNode[]; focusIdx: number };

/**
 * 툴바의 목록 버튼. 글머리 블록이면 문단으로 되돌리고, 문단이면 **캐럿이 있는 줄만**
 * 글머리로 떼어 낸다(문단 하나에 여러 줄이 들어 있으므로 위·아래 줄은 문단으로 남는다).
 */
export function toggleBullet(
  body: BlockNode[],
  idx: number,
  text: string,
  cursor: number,
): BodyEdit | null {
  const block = body[idx];
  if (block?.type === "bullet") {
    return { body: replaceAt(body, idx, [{ type: "paragraph", text }]), focusIdx: idx };
  }
  if (block?.type !== "paragraph") return null;

  const lines = text.split("\n");
  const at = text.slice(0, cursor).split("\n").length - 1;
  const out: BlockNode[] = [];
  if (at > 0) out.push({ type: "paragraph", text: lines.slice(0, at).join("\n") });
  out.push({ type: "bullet", text: lines[at] ?? "" });
  if (at < lines.length - 1) {
    out.push({ type: "paragraph", text: lines.slice(at + 1).join("\n") });
  }
  return { body: replaceAt(body, idx, out), focusIdx: idx + (at > 0 ? 1 : 0) };
}

/**
 * 글머리 블록에 개행이 들어왔을 때(Return·여러 줄 붙여넣기). 줄마다 글머리 하나가
 * 되고 캐럿은 마지막 줄로 간다. 내용 없이 개행만 있으면 **목록을 끝낸다** — 그 자리가
 * 빈 문단이 된다.
 */
export function splitBulletLines(
  body: BlockNode[],
  idx: number,
  text: string,
): BodyEdit {
  if (text.replace(/\n/g, "") === "") {
    return { body: replaceAt(body, idx, [{ type: "paragraph", text: "" }]), focusIdx: idx };
  }
  const lines = text.split("\n");
  return {
    body: replaceAt(
      body,
      idx,
      lines.map((line) => ({ type: "bullet", text: line })),
    ),
    focusIdx: idx + lines.length - 1,
  };
}

function replaceAt(body: BlockNode[], idx: number, blocks: BlockNode[]): BlockNode[] {
  const next = body.slice();
  next.splice(idx, 1, ...blocks);
  return next;
}
