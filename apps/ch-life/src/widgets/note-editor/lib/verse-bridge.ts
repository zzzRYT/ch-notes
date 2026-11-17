import { Node } from "@tiptap/core";
import { Plugin, type EditorState } from "@tiptap/pm/state";
import { BridgeExtension, type EditorBridge } from "@10play/tentap-editor";
import { VERSE_NODE } from "./rich-doc";
import { verseInsertTransaction, verseShape } from "./verse-insert";

// WebView 번들(editor-web)과 RN 양쪽이 **같은 이 파일**을 쓴다 — tentap은 이름이
// RN 설정에 없는 브리지를 웹에서 버린다. 참조 판정·본문 조회는 RN이 한다
// (bible.json을 웹 번들에 넣지 않고, 판정 코드도 features/scripture/insert 하나로 둔다).
//
// 흐름: 웹에서 문단·제목·글머리·할 일·인용문에 스페이스 입력 → 캐럿 앞 텍스트를 RN에 보냄 →
// RN이 detectRefAtCursor + 조회 → 인용 블록을 돌려줌 → 웹이 [앞][인용][뒤]로 나눈다.

const TRIGGER = "verse-trigger";
const RESOLVE = "verse-resolve";
// 인용 카드를 눌렀다(웹 → RN) / 참조를 바꾼 인용으로 교체하라(RN → 웹). RULE-EDIT-014.
const EDIT = "verse-edit";
const REPLACE = "verse-replace";

// Enter는 문단을 먼저 나눈 뒤 응답이 온다 — 지울 트리거 글자가 없다.
export type TriggerKey = "space" | "enter";
export type VerseTrigger = { before: string; pos: number; key: TriggerKey };
export type VerseResolve = {
  pos: number;
  key: TriggerKey;
  // 지울 글자 수(참조 + 그 앞 공백). 트리거 스페이스 한 칸은 별도로 지운다.
  cut: number;
  refText: string;
  block: string;
  label: string;
};

// `block`은 누른 인용의 현재 JSON — 교체할 때 그 사이 바뀌지 않았는지 대조한다.
export type VerseEdit = { pos: number; block: string };
export type VerseReplace = VerseEdit & { next: string; label: string };

type Msg = { type: string; payload?: unknown };

function post(msg: Msg) {
  (window as unknown as { ReactNativeWebView?: { postMessage(s: string): void } })
    .ReactNativeWebView?.postMessage(JSON.stringify(msg));
}

function postTrigger(state: EditorState, pos: number, key: TriggerKey) {
  const $pos = state.doc.resolve(pos);
  // 목록·인용문 안에서도 확정하되 카드는 최상위로 꺼낸다(verse-insert) — 저장 모델이 평탄한 BlockNode[]다.
  if (!verseShape($pos)) return;
  const before = $pos.parent.textBetween(0, $pos.parentOffset, undefined, "\n");
  post({ type: TRIGGER, payload: { before, pos, key } satisfies VerseTrigger });
}

const VerseQuote = Node.create({
  name: VERSE_NODE,
  group: "block",
  atom: true,
  selectable: true,

  addAttributes() {
    return { block: { default: "{}" }, label: { default: "" } };
  },
  parseHTML() {
    return [{ tag: "div[data-verse-quote]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", { ...HTMLAttributes, "data-verse-quote": "" }];
  },

  addNodeView() {
    return ({ node, getPos }) => {
      const dom = document.createElement("div");
      dom.className = "verse-quote";
      dom.contentEditable = "false";
      // mousedown을 막아 노드 선택·키보드가 뜨지 않게 하고, click에서 RN에 시트를 부탁한다.
      dom.addEventListener("mousedown", (ev) => ev.preventDefault());
      dom.addEventListener("click", () => {
        const pos = typeof getPos === "function" ? getPos() : undefined;
        if (typeof pos !== "number") return;
        post({ type: EDIT, payload: { pos, block: String(node.attrs.block) } satisfies VerseEdit });
      });
      const head = document.createElement("div");
      head.className = "verse-quote__ref";
      const toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "verse-quote__toggle";
      toggle.textContent = "▾";
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", `${node.attrs.label} 접기`);
      toggle.addEventListener("click", (ev) => {
        ev.stopPropagation();
        const collapsed = dom.dataset.collapsed !== "true";
        dom.dataset.collapsed = String(collapsed);
        toggle.textContent = collapsed ? "▸" : "▾";
        toggle.setAttribute("aria-expanded", String(!collapsed));
        toggle.setAttribute("aria-label", `${node.attrs.label} ${collapsed ? "펼치기" : "접기"}`);
      });
      head.appendChild(toggle);
      head.appendChild(document.createTextNode(String(node.attrs.label)));
      dom.appendChild(head);
      const block = JSON.parse(String(node.attrs.block)) as {
        verses?: { verse: number; text: string }[];
      };
      for (const v of block.verses ?? []) {
        const row = document.createElement("div");
        row.className = "verse-quote__row";
        row.innerHTML = `<span class="verse-quote__num"></span><span></span>`;
        row.children[0]!.textContent = String(v.verse);
        row.children[1]!.textContent = v.text;
        dom.appendChild(row);
      }
      return { dom };
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          handleTextInput(view, from, to, text) {
            if (text === " " && from === to) postTrigger(view.state, from, "space");
            return false;
          },
          // Enter는 막지 않는다 — 문단이 먼저 나뉘고, 응답이 오면 그 사이에 카드를 끼운다.
          handleKeyDown(view, event) {
            const { selection } = view.state;
            if (event.key === "Enter" && !event.shiftKey && !event.isComposing && selection.empty) {
              postTrigger(view.state, selection.from, "enter");
            }
            return false;
          },
        },
      }),
    ];
  },
});

// RN이 돌려준 인용을 문서에 넣는다. 그 사이 문서가 바뀌었으면(빠른 연타) 버린다.
function applyResolve(editor: import("@tiptap/core").Editor, r: VerseResolve) {
  const { state } = editor;
  const card = state.schema.nodes[VERSE_NODE]!.create({ block: r.block, label: r.label });
  const tr = verseInsertTransaction(state, r, card);
  if (tr) editor.view.dispatch(tr.scrollIntoView());
}

// 그 자리가 아직 누른 인용 그대로일 때만 바꾼다.
function applyReplace(editor: import("@tiptap/core").Editor, r: VerseReplace) {
  const node = editor.state.doc.nodeAt(r.pos);
  if (node?.type.name !== VERSE_NODE || node.attrs.block !== r.block) return;
  editor.view.dispatch(editor.state.tr.setNodeMarkup(r.pos, undefined, { block: r.next, label: r.label }));
}

type Resolver = (t: VerseTrigger, editor: EditorBridge) => void;
let resolver: Resolver | null = null;
// RN(NoteEditor)이 마운트 때 등록한다.
export function setVerseResolver(fn: Resolver | null) {
  resolver = fn;
}

let editHandler: ((e: VerseEdit) => void) | null = null;
export function setVerseEditHandler(fn: ((e: VerseEdit) => void) | null) {
  editHandler = fn;
}

export const VerseQuoteBridge = new BridgeExtension<object, object, Msg>({
  tiptapExtension: VerseQuote,
  onBridgeMessage: (editor, message) => {
    if (message?.type === RESOLVE) applyResolve(editor, message.payload as VerseResolve);
    else if (message?.type === REPLACE) applyReplace(editor, message.payload as VerseReplace);
    return false;
  },
  onEditorMessage: (message, bridge) => {
    if (message?.type === TRIGGER) resolver?.(message.payload as VerseTrigger, bridge);
    else if (message?.type === EDIT) editHandler?.(message.payload as VerseEdit);
    else return false;
    return true;
  },
  extendEditorInstance: (send) => ({
    resolveVerse: (payload: VerseResolve) => send({ type: RESOLVE, payload }),
    replaceVerse: (payload: VerseReplace) => send({ type: REPLACE, payload }),
  }),
  extendEditorState: () => ({}),
});

declare module "@10play/tentap-editor" {
  interface EditorBridge {
    resolveVerse: (payload: VerseResolve) => void;
    replaceVerse: (payload: VerseReplace) => void;
  }
}
