import { Extension, markInputRule, type Editor } from "@tiptap/core";
import { Plugin } from "@tiptap/pm/state";
import type { EditorView } from "@tiptap/pm/view";
import { CARET, type Caret } from "../src/widgets/note-editor/lib/doc-sync-bridge";

// `++밑줄++` — Bold(`**`)·Italic(`_`)은 TipTap 기본 입력 규칙이 이미 있다.
export const UnderlineInputRule = Extension.create({
  name: "underlineInputRule",
  addInputRules() {
    return [
      markInputRule({
        find: /(?:^|\s)(\+\+(?!\s)([^+]+)(?<!\s)\+\+)$/,
        type: this.editor.schema.marks.underline!,
      }),
    ];
  },
});

type Item = { label: string; hint: string; keys: string[]; run: (e: Editor) => void };

const ITEMS: Item[] = [
  { label: "제목 1", hint: "#", keys: ["h1", "제목", "heading"], run: (e) => e.chain().focus().setHeading({ level: 1 }).run() },
  { label: "제목 2", hint: "##", keys: ["h2", "제목", "heading"], run: (e) => e.chain().focus().setHeading({ level: 2 }).run() },
  { label: "본문", hint: "", keys: ["본문", "text", "p"], run: (e) => e.chain().focus().setParagraph().run() },
  { label: "글머리 목록", hint: "-", keys: ["목록", "list", "bullet", "ul"], run: (e) => e.chain().focus().toggleBulletList().run() },
  { label: "할 일", hint: "[]", keys: ["할일", "todo", "task", "체크"], run: (e) => e.chain().focus().toggleTaskList().run() },
  { label: "인용문", hint: ">", keys: ["인용", "quote"], run: (e) => e.chain().focus().toggleBlockquote().run() },
];

// 캐럿 앞이 `/검색어`(줄 처음 또는 공백 뒤)이면 메뉴를 띄운다.
const SLASH = /(?:^|\s)\/([^\s/]*)$/;

// Notion식 "/" 메뉴. ↑↓로 고르고 Enter, Esc로 닫는다. 터치로 눌러도 된다.
export const SlashMenu = Extension.create({
  name: "slashMenu",
  addProseMirrorPlugins() {
    const editor = this.editor;
    const menu = document.createElement("div");
    menu.className = "slash-menu";
    document.body.appendChild(menu);

    let open = false;
    let items: Item[] = [];
    let index = 0;
    let range = { from: 0, to: 0 };
    let dismissedAt = -1;
    let editorDom: HTMLElement | null = null;
    let originalPaddingBottom = "";
    let basePaddingBottom = 0;
    let extraPaddingBottom = 0;

    const choose = (i: number) => {
      const item = items[i];
      if (!item) return;
      editor.chain().deleteRange(range).run();
      item.run(editor);
      hide();
    };
    const hide = () => {
      open = false;
      menu.style.display = "none";
      if (editorDom) editorDom.style.paddingBottom = originalPaddingBottom;
      editorDom = null;
      extraPaddingBottom = 0;
    };
    const render = (view: EditorView) => {
      menu.replaceChildren(
        ...items.map((item, i) => {
          const row = document.createElement("div");
          row.className = "slash-menu__item" + (i === index ? " is-active" : "");
          row.innerHTML = `<span></span><span class="slash-menu__hint"></span>`;
          row.children[0]!.textContent = item.label;
          row.children[1]!.textContent = item.hint;
          // mousedown에서 막아야 에디터 포커스(=키보드)가 유지된다.
          row.addEventListener("mousedown", (ev) => {
            ev.preventDefault();
            choose(i);
          });
          return row;
        }),
      );
      const c = view.coordsAtPos(range.from);
      menu.style.display = "block";
      menu.style.left = `${Math.min(c.left, window.innerWidth - 220)}px`;
      // 메뉴를 항상 캐럿 아래에 둔다. 부족한 만큼 문서 하단 패딩을 늘려
      // dynamicHeight WebView와 바깥 ScrollView가 메뉴까지 보이게 한다.
      const below = c.bottom + window.scrollY + 4;
      menu.style.top = `${below}px`;
      if (editorDom !== view.dom) {
        editorDom = view.dom;
        originalPaddingBottom = editorDom.style.paddingBottom;
        basePaddingBottom = Number.parseFloat(getComputedStyle(editorDom).paddingBottom) || 0;
        extraPaddingBottom = 0;
      }
      const editorBottom = view.dom.getBoundingClientRect().bottom + window.scrollY - extraPaddingBottom;
      extraPaddingBottom = Math.max(0, below + menu.offsetHeight - editorBottom + 8);
      view.dom.style.paddingBottom = `${basePaddingBottom + extraPaddingBottom}px`;
    };

    return [
      new Plugin({
        view: () => ({
          update(view) {
            const { selection } = view.state;
            const $from = selection.$from;
            const before = selection.empty
              ? $from.parent.textBetween(0, $from.parentOffset, undefined, "￼")
              : "";
            const m = SLASH.exec(before);
            const slashPos = m ? $from.pos - m[1]!.length - 1 : -1;
            if (!m || slashPos === dismissedAt) return hide();
            const q = m[1]!.toLowerCase();
            items = ITEMS.filter(
              (it) => !q || it.label.includes(q) || it.keys.some((k) => k.startsWith(q)),
            );
            if (!items.length) return hide();
            if (!open) index = 0;
            index = Math.min(index, items.length - 1);
            range = { from: slashPos, to: $from.pos };
            open = true;
            render(view);
          },
          destroy: () => menu.remove(),
        }),
        props: {
          handleKeyDown(view, event) {
            if (!open) return false;
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              const d = event.key === "ArrowDown" ? 1 : -1;
              index = (index + d + items.length) % items.length;
              render(view);
              return true;
            }
            if (event.key === "Enter" || event.key === "Tab") {
              choose(index);
              return true;
            }
            if (event.key === "Escape") {
              dismissedAt = range.from;
              hide();
              return true;
            }
            return false;
          },
        },
      }),
    ];
  },
});

// iPadOS WKWebView는 하드웨어 Cmd+B/I/U를 UIKit 서식 명령으로 가로채 keydown을 주지 않고
// `beforeinput`(formatBold 등)만 보낸다. 그걸 TipTap 명령으로 옮긴다.
const FORMAT_INPUT: Record<string, (e: Editor) => boolean> = {
  formatBold: (e) => e.commands.toggleBold(),
  formatItalic: (e) => e.commands.toggleItalic(),
  formatUnderline: (e) => e.commands.toggleUnderline(),
};

export const HardwareFormatKeys = Extension.create({
  name: "hardwareFormatKeys",
  addProseMirrorPlugins() {
    const editor = this.editor;
    return [
      new Plugin({
        props: {
          handleDOMEvents: {
            beforeinput(_view, event) {
              const run = FORMAT_INPUT[(event as InputEvent).inputType];
              if (!run) return false;
              event.preventDefault();
              run(editor);
              return true;
            },
          },
        },
      }),
    ];
  },
});

// 캐럿 위치를 RN에 알린다 — 웹뷰가 문서 높이만큼 늘어나 스스로 스크롤하지 않으므로
// 캐럿을 화면에 두는 일(키보드 위 여백 포함)은 RN의 ScrollView가 한다.
// 포커스를 얻을 때도 보낸다: 처음 탭하면 캐럿을 놓는 트랜잭션이 포커스보다 먼저라
// 그때는 보낼 수 없고, RN은 이 값을 들고 있다가 키보드가 뜨면 스크롤한다. 잃으면 null.
function postCaret(payload: Caret | null) {
  (window as unknown as { ReactNativeWebView?: { postMessage(s: string): void } })
    .ReactNativeWebView?.postMessage(JSON.stringify({ type: CARET, payload }));
}

function reportCaret(view: EditorView, typing: boolean) {
  requestAnimationFrame(() => {
    const c = view.coordsAtPos(view.state.selection.head);
    const menu = document.querySelector<HTMLElement>(".slash-menu");
    const menuOpen = !!menu && getComputedStyle(menu).display !== "none";
    postCaret({
      top: c.top,
      bottom: menuOpen ? Math.max(c.bottom, menu.getBoundingClientRect().bottom) : c.bottom,
      typing: typing && !menuOpen,
    });
  });
}

export const CaretReport = Extension.create({
  name: "caretReport",
  onFocus() {
    reportCaret(this.editor.view, false);
  },
  onBlur() {
    postCaret(null);
  },
  onTransaction({ transaction }) {
    const view = this.editor.view;
    // 포커스가 없으면(본문을 불러와 setContent한 경우 등) 스크롤할 이유가 없다.
    if ((!transaction.docChanged && !transaction.selectionSet) || !view.hasFocus()) return;
    reportCaret(view, !transaction.getMeta("pointer"));
  },
});
