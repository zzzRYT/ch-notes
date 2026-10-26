import { Fragment, type Node as PMNode, type ResolvedPos } from "@tiptap/pm/model";
import { TextSelection, type EditorState, type Transaction } from "@tiptap/pm/state";

// 인용 카드를 문서에 끼우는 순수 변환. verse-bridge(tentap·RN 의존)에서 떼어 내
// Editor 없이 시험한다. 저장 모델은 평탄한 BlockNode[]라 카드는 **항상 최상위**여야 한다 —
// 목록·인용문 안의 카드는 화면에는 보여도 저장(docToBlocks)에서 조용히 사라진다.

export type VerseInsertTarget = {
  pos: number;
  key: "space" | "enter";
  // 지울 글자 수(참조 + 그 앞 공백). 트리거 스페이스 한 칸은 별도로 지운다.
  cut: number;
  refText: string;
};

const LISTS = new Set(["bulletList", "orderedList", "taskList"]);
const ITEMS = new Set(["listItem", "taskItem"]);
const TEXT_BLOCKS = new Set(["paragraph", "heading"]);

type Shape = "top" | "quote" | "list";

// 확정을 받는 자리의 모양. 이 밖(코드 블록, 인용 노드 자체, 중첩 목록, 목록 안 인용문 …)은
// 안전하게 갈라 낼 수 없어 null — 트리거도 보내지 않는다.
//   top   doc > paragraph|heading
//   quote doc > blockquote > paragraph|heading
//   list  doc > bulletList|orderedList|taskList > listItem|taskItem > (첫 자식) paragraph
export function verseShape($pos: ResolvedPos): Shape | null {
  if (!TEXT_BLOCKS.has($pos.parent.type.name)) return null;
  switch ($pos.depth) {
    case 1:
      return "top";
    case 2:
      return $pos.node(1).type.name === "blockquote" ? "quote" : null;
    case 3:
      return LISTS.has($pos.node(1).type.name) &&
        ITEMS.has($pos.node(2).type.name) &&
        $pos.index(2) === 0
        ? "list"
        : null;
    default:
      return null;
  }
}

function asParagraph(node: PMNode): PMNode | null {
  if (!node.isTextblock) return null;
  const paragraph = node.type.schema.nodes.paragraph!;
  return node.type === paragraph ? node : paragraph.create(null, node.content);
}

// 갈라진 뒤의 최상위 뒤쪽 조각을 "문단 + (남은 컨테이너)"로 푼다.
// 제목·문단은 문단으로, 인용문·목록은 첫 블록/첫 항목만 꺼내고 나머지는 컨테이너에 남긴다.
function unwrapTrailing(shape: Shape, trailing: PMNode): PMNode[] | null {
  if (shape === "top") {
    const p = asParagraph(trailing);
    return p && [p];
  }
  const first = trailing.firstChild;
  if (!first) return null;
  const rest = trailing.childCount > 1 ? [trailing.copy(trailing.content.cut(first.nodeSize))] : [];
  if (shape === "quote") {
    const p = asParagraph(first);
    return p && [p, ...rest];
  }
  const lead = first.firstChild;
  const p = lead && ITEMS.has(first.type.name) ? asParagraph(lead) : null;
  if (!p) return null;
  const tail: PMNode[] = [];
  first.forEach((child, _o, i) => {
    if (i > 0) tail.push(child);
  });
  return [p, ...tail, ...rest];
}

// [앞 블록(원래 종류)] [카드(최상위)] [뒤 → 문단] 으로 바꾸는 트랜잭션. 문서가 그 사이 바뀌었거나
// (빠른 연타) 안전하지 않은 모양이면 null — 호출한 쪽은 아무것도 하지 않는다.
export function verseInsertTransaction(
  state: EditorState,
  r: VerseInsertTarget,
  card: PMNode,
): Transaction | null {
  const space = r.key === "space";
  const from = r.pos - r.cut;
  const end = space ? r.pos + 1 : r.pos;
  const { doc } = state;
  if (from < 0 || end > doc.content.size) return null;
  if (doc.textBetween(from, end) !== r.refText + (space ? " " : "")) return null;
  const $from = doc.resolve(from);
  const $end = doc.resolve(end);
  const shape = verseShape($from);
  if (!shape || !$from.sameParent($end)) return null;

  const tr = state.tr.delete(from, end);
  let topEnd: number;
  // 뒤쪽 조각의 첫 텍스트 블록 안에서 캐럿이 있어야 할 오프셋(없으면 매핑에 맡긴다).
  let caretInRest: number | null;

  if (space) {
    // 캐럿에서 최상위 직계까지 모든 조상을 가른다.
    tr.split(from, $from.depth);
    topEnd = tr.doc.resolve(from).after(1);
    caretInRest = 0;
  } else {
    // Enter: 그사이 Enter가 블록을 이미 나눴다 — 참조는 앞 블록의 끝이고 그 뒤에 형제가 있어야 한다.
    if ($end.parentOffset !== $end.parent.content.size) return null;
    const container = $end.node(shape === "top" ? 0 : 1);
    const at = $end.index(shape === "top" ? 0 : 1);
    if (at + 1 >= container.childCount) return null;
    if (shape === "top") {
      topEnd = tr.mapping.map($end.after(1));
    } else {
      // 목록은 항목 사이, 인용문은 블록 사이에서 컨테이너를 둘로 가른다.
      const between = tr.mapping.map($end.after(2));
      tr.split(between, 1);
      topEnd = tr.doc.resolve(between).after(1);
    }
    // 캐럿은 Enter가 만든 뒤 블록에 있다. 그 안 오프셋을 옮겨 심는다.
    const rest = shape === "list" ? container.child(at + 1).firstChild : container.child(at + 1);
    if (!rest?.isTextblock) return null;
    const restStart = $end.after(shape === "top" ? 1 : 2) + (shape === "list" ? 2 : 1);
    const head = state.selection.head;
    caretInRest =
      state.selection.empty && head >= restStart && head <= restStart + rest.content.size
        ? head - restStart
        : null;
  }

  const trailing = tr.doc.nodeAt(topEnd);
  const unwrapped = trailing && unwrapTrailing(shape, trailing);
  if (!trailing || !unwrapped) return null;
  tr.replaceWith(topEnd, topEnd + trailing.nodeSize, Fragment.from([card, ...unwrapped]));
  if (caretInRest !== null) {
    // 뒤 문단은 카드 바로 다음이다: 문단 여는 토큰 1칸 뒤가 내용의 시작.
    tr.setSelection(TextSelection.create(tr.doc, topEnd + card.nodeSize + 1 + caretInRest));
  }
  return tr;
}
