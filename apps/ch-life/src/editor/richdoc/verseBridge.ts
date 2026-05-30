import { Node, InputRule } from "@tiptap/core";
import type { Editor } from "@tiptap/core";
import { BridgeExtension, type EditorBridge } from "@10play/tentap-editor";

// Shared by BOTH the WebView editor bundle (editor-web) and the React-Native
// side. Defining the node + bridge once guarantees the bridge `name` matches on
// both sides — tentap drops any web bridge whose name is absent from the RN
// config map. The offline scripture lookup itself is NOT here (it would drag
// bible.json into the web bundle); RN registers it via setVerseLookupHandler.

// web → RN: "this looks like a reference, please resolve it"
export const VERSE_LOOKUP_REQUEST = "verse-lookup-request";
// RN → web: "here are the verses (or it was invalid)"
export const VERSE_RESOLVE = "verse-resolve";

export type VerseLookupRequest = {
  type: typeof VERSE_LOOKUP_REQUEST;
  payload: { ref: string; requestId: string };
};

export type VerseResolvePayload = {
  requestId: string;
  ok: boolean;
  ref: string;
  label?: string;
  verses?: { book: string; chapter: number; verse: number; text: string }[];
};

type NativeWindow = Window & {
  ReactNativeWebView?: { postMessage: (data: string) => void };
};

// Reference shape, mirroring src/editor/useAutocomplete.ts. Group 1 is the
// boundary (start-of-block or a separator) we must preserve; group 2 is the ref.
const RANGE_SEP = "[-~–〜～]";
const VERSE_TRIGGER = new RegExp(
  `(^|[\\s(［(])((?:[가-힣]{1,8}|[A-Za-z]{2,20})\\s?\\d{1,3}:\\d{1,3}(?:${RANGE_SEP}\\d{1,3})?)\\s$`,
);

function makeRequestId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function postLookupRequest(ref: string, requestId: string): void {
  if (typeof window === "undefined") return;
  const w = window as NativeWindow;
  w.ReactNativeWebView?.postMessage(
    JSON.stringify({ type: VERSE_LOOKUP_REQUEST, payload: { ref, requestId } }),
  );
}

// ---- Custom TipTap node (read-only scripture block) -------------------------

export const VerseQuote = Node.create({
  name: "verseQuote",
  group: "block",
  atom: true,
  selectable: true,
  draggable: false,

  addAttributes() {
    return {
      ref: { default: "" },
      label: { default: "" },
      verses: { default: "[]" },
      status: { default: "loaded" },
      // Set while an inline-typed ref is awaiting offline resolution.
      pending: { default: null },
      // Original typed text, restored if the ref turns out to be invalid.
      raw: { default: "" },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-verse-quote]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", { ...HTMLAttributes, "data-verse-quote": "" }];
  },

  addInputRules() {
    const type = this.type;
    return [
      new InputRule({
        find: VERSE_TRIGGER,
        handler: ({ state, range, match }) => {
          const ref = match[2];
          if (!ref) return null;
          const lead = match[1] ? match[1].length : 0;
          const from = range.from + lead;
          const to = range.to;
          const requestId = makeRequestId();
          const node = type.create({
            ref,
            label: ref,
            verses: "[]",
            status: "loading",
            pending: requestId,
            raw: ref,
          });
          state.tr.replaceRangeWith(from, to, node);
          postLookupRequest(ref, requestId);
          return undefined;
        },
      }),
    ];
  },

  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement("div");
      dom.setAttribute("data-verse-quote", "");
      dom.className = "verse-quote";
      dom.contentEditable = "false";

      const header = document.createElement("div");
      header.className = "verse-quote__ref";
      header.textContent =
        (node.attrs.label as string) || (node.attrs.ref as string) || "";
      dom.appendChild(header);

      const status = node.attrs.status as string;
      if (status === "loading") {
        const row = document.createElement("div");
        row.className = "verse-quote__hint";
        row.textContent = "불러오는 중…";
        dom.appendChild(row);
      } else if (status === "error") {
        const row = document.createElement("div");
        row.className = "verse-quote__error";
        row.textContent = "본문을 찾을 수 없습니다";
        dom.appendChild(row);
      } else {
        let verses: { verse?: number; text?: string }[] = [];
        try {
          const parsed = JSON.parse((node.attrs.verses as string) || "[]");
          if (Array.isArray(parsed)) verses = parsed;
        } catch {
          verses = [];
        }
        for (const v of verses) {
          const row = document.createElement("div");
          row.className = "verse-quote__row";
          const num = document.createElement("span");
          num.className = "verse-quote__num";
          num.textContent = v.verse != null ? String(v.verse) : "";
          const txt = document.createElement("span");
          txt.className = "verse-quote__text";
          txt.textContent = v.text ?? "";
          row.appendChild(num);
          row.appendChild(txt);
          dom.appendChild(row);
        }
      }
      return { dom };
    };
  },
});

// ---- RN-side lookup handler registration ------------------------------------

type VerseLookupHandler = (
  ref: string,
  requestId: string,
  editor: EditorBridge,
) => void;

let lookupHandler: VerseLookupHandler | null = null;

// Called once on the RN side (RichNoteEditor) to wire the offline bible lookup.
export function setVerseLookupHandler(fn: VerseLookupHandler | null): void {
  lookupHandler = fn;
}

// ---- Web-side resolution (apply RN's answer to the loading node) ------------

function resolveOnWeb(editor: Editor, payload: VerseResolvePayload): void {
  let target: { pos: number; size: number; raw: string } | null = null;
  editor.state.doc.descendants((node, pos) => {
    if (target) return false;
    if (node.type.name === "verseQuote" && node.attrs.pending === payload.requestId) {
      target = { pos, size: node.nodeSize, raw: (node.attrs.raw as string) || "" };
      return false;
    }
    return true;
  });
  if (!target) return;
  const { pos, size, raw } = target;

  if (payload.ok) {
    editor.view.dispatch(
      editor.state.tr.setNodeMarkup(pos, undefined, {
        ref: payload.ref,
        label: payload.label ?? payload.ref,
        verses: JSON.stringify(payload.verses ?? []),
        status: "loaded",
        pending: null,
        raw: "",
      }),
    );
  } else {
    // Invalid ref: drop the placeholder and restore the user's typed text.
    const text = raw || payload.ref;
    const paragraph = editor.state.schema.nodes.paragraph!.create(
      null,
      text ? editor.state.schema.text(`${text} `) : undefined,
    );
    editor.view.dispatch(editor.state.tr.replaceWith(pos, pos + size, paragraph));
  }
}

// ---- The bridge (same instance referenced on both sides) --------------------

export const VerseQuoteBridge = new BridgeExtension<object, object, { type: string; payload?: unknown }>({
  tiptapExtension: VerseQuote,
  // Runs on web: apply RN's resolution to the pending node.
  onBridgeMessage: (editor, message) => {
    if (message?.type === VERSE_RESOLVE) {
      resolveOnWeb(editor, message.payload as VerseResolvePayload);
    }
    return false;
  },
  // Runs on RN: a web-detected ref needs offline resolution.
  onEditorMessage: (message, editorBridge) => {
    if (message?.type === VERSE_LOOKUP_REQUEST) {
      const payload = message.payload as VerseLookupRequest["payload"];
      lookupHandler?.(payload.ref, payload.requestId, editorBridge);
      return true;
    }
    return false;
  },
  // Runs on RN: exposes the command that pushes a resolution back to the web.
  extendEditorInstance: (sendBridgeMessage) => ({
    resolveVerse: (payload: VerseResolvePayload) =>
      sendBridgeMessage({ type: VERSE_RESOLVE, payload }),
  }),
  extendEditorState: () => ({}),
});

// Augment the editor bridge with the RN-side command added above.
declare module "@10play/tentap-editor" {
  interface EditorBridge {
    resolveVerse: (payload: VerseResolvePayload) => void;
  }
}
