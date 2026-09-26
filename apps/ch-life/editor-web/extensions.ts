import { Extension, markInputRule, type Editor } from "@tiptap/core";
import { Plugin } from "@tiptap/pm/state";
import type { EditorView } from "@tiptap/pm/view";

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
      menu.style.top = `${c.bottom + window.scrollY + 4}px`;
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

// 타이핑하며 내려가도 캐럿이 화면 맨 아래에 붙지 않게 한다 — 보이는 높이의 아래
// CARET_BOTTOM_ROOM만큼은 늘 비워 둔다. iOS의 기본 캐럿 추적은 "겨우 보이게"까지만
// 올리므로, 캐럿 자리에 보이지 않는 표식을 두고 scroll-margin을 준 채 scrollIntoView
// 한다. 끝 문단도 올라올 수 있게 index.html에서 본문 뒤에 빈 공간(::after)을 둔다.
const CARET_BOTTOM_ROOM = 0.4;

export const CaretBottomRoom = Extension.create({
  name: "caretBottomRoom",
  onTransaction({ transaction }) {
    // 터치로 캐럿을 놓은 건 건드리지 않는다(화면이 튄다). 입력·키보드 이동만.
    if (transaction.getMeta("pointer") || (!transaction.docChanged && !transaction.selectionSet)) return;
    const view = this.editor.view;
    requestAnimationFrame(() => {
      const scroller = view.dom.closest<HTMLElement>("#root > div");
      if (!scroller || !view.state.selection.empty) return;
      const caret = view.coordsAtPos(view.state.selection.head);
      const marker = document.createElement("div");
      const top = caret.bottom - scroller.getBoundingClientRect().top + scroller.scrollTop;
      marker.style.cssText = `position:absolute;left:0;top:${top}px;width:1px;height:1px;pointer-events:none;`;
      // RN이 키보드 높이를 알려 준다(__kbInset) — 가려진 만큼은 보이는 높이가 아니다.
      const kb = (window as unknown as { __kbInset?: number }).__kbInset ?? 0;
      marker.style.scrollMarginBottom = `${Math.round((window.innerHeight - kb) * CARET_BOTTOM_ROOM)}px`;
      scroller.appendChild(marker);
      marker.scrollIntoView({ block: "nearest" });
      marker.remove();
    });
  },
});
