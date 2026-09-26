import { Extension } from "@tiptap/core";
import { BridgeExtension } from "@10play/tentap-editor";
import type { PMDoc } from "./rich-doc";

// 웹 → RN 본문 동기화. tentap의 useEditorContent는 RN이 injectJavaScript로 getJSON을
// 요청하는데, iOS에서 그 주입이 한글 조합을 끊어 다음 글자를 삼킨다(스파이크에서 재현).
// 그래서 방향을 뒤집는다: 웹이 멈춘 뒤 스스로 보내고, 조합 중이면 미룬다.
const DOC_CHANGED = "doc-changed";
// 웹 에디터가 만들어졌다 — RN은 이때 최신 본문을 넣는다. tentap의 isReady는
// 컴포넌트가 다시 마운트되면 true가 안 되는 경우가 있어 직접 알린다.
const DOC_READY = "doc-ready";
const DEBOUNCE_MS = 500;

type Listener = { onDoc: (doc: PMDoc) => void; onReady: () => void };
let listener: Listener | null = null;
export function setDocListener(fn: Listener | null) {
  listener = fn;
}

type NativeWindow = {
  __docSyncTimer?: ReturnType<typeof setTimeout>;
  ReactNativeWebView?: { postMessage(s: string): void };
};

const DocSync = Extension.create({
  name: "docSync",
  onCreate() {
    (window as unknown as NativeWindow).ReactNativeWebView?.postMessage(
      JSON.stringify({ type: DOC_READY }),
    );
  },
  onUpdate() {
    const editor = this.editor;
    const w = window as unknown as NativeWindow;
    clearTimeout(w.__docSyncTimer);
    const flush = () => {
      if (editor.view.composing) {
        w.__docSyncTimer = setTimeout(flush, DEBOUNCE_MS);
        return;
      }
      w.ReactNativeWebView?.postMessage(
        JSON.stringify({ type: DOC_CHANGED, payload: editor.getJSON() }),
      );
    };
    w.__docSyncTimer = setTimeout(flush, DEBOUNCE_MS);
  },
});

export const DocSyncBridge = new BridgeExtension<object, object, { type: string; payload?: unknown }>({
  tiptapExtension: DocSync,
  onBridgeMessage: () => false,
  onEditorMessage: (message) => {
    if (message?.type === DOC_READY) listener?.onReady();
    else if (message?.type === DOC_CHANGED) listener?.onDoc(message.payload as PMDoc);
    else return false;
    return true;
  },
  extendEditorInstance: () => ({}),
  extendEditorState: () => ({}),
});
