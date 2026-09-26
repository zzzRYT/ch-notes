import { Node } from "@tiptap/core";
import { Plugin, TextSelection } from "@tiptap/pm/state";
import { BridgeExtension, type EditorBridge } from "@10play/tentap-editor";
import { VERSE_NODE } from "./rich-doc";

// WebView 번들(editor-web)과 RN 양쪽이 **같은 이 파일**을 쓴다 — tentap은 이름이
// RN 설정에 없는 브리지를 웹에서 버린다. 참조 판정·본문 조회는 RN이 한다
// (bible.json을 웹 번들에 넣지 않고, 판정 코드도 features/scripture/insert 하나로 둔다).
//
// 흐름: 웹에서 최상위 문단에 스페이스 입력 → 캐럿 앞 텍스트를 RN에 보냄 →
// RN이 detectRefAtCursor + 조회 → 인용 블록을 돌려줌 → 웹이 [앞][인용][뒤]로 나눈다.

const TRIGGER = "verse-trigger";
const RESOLVE = "verse-resolve";

export type VerseTrigger = { before: string; pos: number };
export type VerseResolve = {
  pos: number;
  // 지울 글자 수(참조 + 그 앞 공백). 스페이스 한 칸은 별도로 지운다.
  cut: number;
  refText: string;
  block: string;
  label: string;
};

type Msg = { type: string; payload?: unknown };

function post(msg: Msg) {
  (window as unknown as { ReactNativeWebView?: { postMessage(s: string): void } })
    .ReactNativeWebView?.postMessage(JSON.stringify(msg));
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
    return ({ node }) => {
      const dom = document.createElement("div");
      dom.className = "verse-quote";
      dom.contentEditable = "false";
      const head = document.createElement("div");
      head.className = "verse-quote__ref";
      head.textContent = String(node.attrs.label);
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
            if (text !== " " || from !== to) return false;
            const $from = view.state.doc.resolve(from);
            // ponytail: 최상위 문단만 — 목록 안 인용은 저장 모델(평탄한 BlockNode[])에 자리가 없다.
            if ($from.depth !== 1 || $from.parent.type.name !== "paragraph") return false;
            const before = $from.parent.textBetween(0, $from.parentOffset, undefined, "\n");
            post({ type: TRIGGER, payload: { before, pos: from } satisfies VerseTrigger });
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
  const from = r.pos - r.cut;
  if (from < 0 || r.pos + 1 > state.doc.content.size) return;
  if (state.doc.textBetween(from, r.pos + 1) !== r.refText + " ") return;
  const node = state.schema.nodes[VERSE_NODE]!.create({ block: r.block, label: r.label });
  const tr = state.tr.delete(from, r.pos + 1).split(from);
  tr.insert(from + 1, node);
  tr.setSelection(TextSelection.create(tr.doc, from + 1 + node.nodeSize + 1));
  editor.view.dispatch(tr.scrollIntoView());
}

type Resolver = (t: VerseTrigger, editor: EditorBridge) => void;
let resolver: Resolver | null = null;
// RN(NoteEditor)이 마운트 때 등록한다.
export function setVerseResolver(fn: Resolver | null) {
  resolver = fn;
}

export const VerseQuoteBridge = new BridgeExtension<object, object, Msg>({
  tiptapExtension: VerseQuote,
  onBridgeMessage: (editor, message) => {
    if (message?.type === RESOLVE) applyResolve(editor, message.payload as VerseResolve);
    return false;
  },
  onEditorMessage: (message, bridge) => {
    if (message?.type !== TRIGGER) return false;
    resolver?.(message.payload as VerseTrigger, bridge);
    return true;
  },
  extendEditorInstance: (send) => ({
    resolveVerse: (payload: VerseResolve) => send({ type: RESOLVE, payload }),
  }),
  extendEditorState: () => ({}),
});

declare module "@10play/tentap-editor" {
  interface EditorBridge {
    resolveVerse: (payload: VerseResolve) => void;
  }
}
