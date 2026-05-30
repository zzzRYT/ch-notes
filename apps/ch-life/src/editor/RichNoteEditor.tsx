import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { StyleSheet, View } from "react-native";
import {
  RichText,
  useEditorBridge,
  useEditorContent,
  TenTapStartKit,
} from "@10play/tentap-editor";
import type { BlockNode } from "@/domain/types";
import { useTheme } from "@/theme/ThemeProvider";
import { formatRef } from "@/parser/format-ref";
import { lookupVerses } from "@/parser/verse-lookup";
import { editorHtml } from "./generated/editorHtml";
import { blocksToDoc, docToBlocks } from "./richdoc/doc";
import { editorThemeCss } from "./richdoc/themeCss";
import { VerseQuoteBridge, setVerseLookupHandler } from "./richdoc/verseBridge";
import { EditorKeyboardToolbar } from "./EditorKeyboardToolbar";

// The full StarterKit feature set plus our scripture node, used identically on
// the RN and web sides so command/state/config wiring lines up.
const BRIDGE_EXTENSIONS = [...TenTapStartKit, VerseQuoteBridge];

type Props = {
  body: BlockNode[];
  onChangeBody: (next: BlockNode[]) => void;
  onOpenBrowser: () => void;
  header?: React.ReactNode;
};

// Imperative handle kept API-compatible with the previous native editor so the
// meta header → body focus handoff continues to work.
export type NoteEditorHandle = {
  focusFirstParagraph: () => void;
};

const CONTENT_DEBOUNCE_MS = 500;

export const RichNoteEditor = forwardRef<NoteEditorHandle, Props>(
  function RichNoteEditor({ body, onChangeBody, onOpenBrowser, header }, ref) {
    const theme = useTheme();
    const { colors } = theme;

    // The editor is the source of truth while editing; we read JSON out of it
    // and mirror it into `body` for autosave. `editorKeyRef` tracks the block
    // shape currently inside the editor so we can tell an editor-originated
    // change (echo, ignore) from an external one (e.g. a verse inserted from the
    // bible browser) that must be pushed back in via setContent.
    const editorKeyRef = useRef<string>(JSON.stringify(body));

    const initialContent = useMemo(
      () => blocksToDoc(body, { labelFor: formatRef }),
      // Built once from the body present at mount; later sync is manual.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [],
    );

    const editor = useEditorBridge({
      customSource: editorHtml,
      initialContent,
      avoidIosKeyboard: true,
      bridgeExtensions: BRIDGE_EXTENSIONS,
      theme: { webview: { backgroundColor: colors.bg } },
    });

    // Wire the offline scripture lookup that resolves inline "창1:1 " triggers.
    // The web side detects the pattern and asks RN; we look it up against the
    // bundled bible.json and push the verses (or an invalid signal) back.
    useEffect(() => {
      setVerseLookupHandler((ref, requestId, bridge) => {
        const verses = lookupVerses(ref);
        bridge.resolveVerse(
          verses
            ? { requestId, ok: true, ref, label: formatRef(ref), verses }
            : { requestId, ok: false, ref },
        );
      });
      return () => setVerseLookupHandler(null);
    }, []);

    useImperativeHandle(
      ref,
      () => ({ focusFirstParagraph: () => editor.focus("end") }),
      [editor],
    );

    const content = useEditorContent(editor, {
      type: "json",
      debounceInterval: CONTENT_DEBOUNCE_MS,
    });

    // Editor → body (one-way out).
    useEffect(() => {
      if (content == null) return;
      const blocks = docToBlocks(content as Parameters<typeof docToBlocks>[0]);
      const key = JSON.stringify(blocks);
      if (key === editorKeyRef.current) return;
      editorKeyRef.current = key;
      onChangeBody(blocks);
    }, [content, onChangeBody]);

    // External body change (not echoed from the editor) → push into the editor.
    useEffect(() => {
      const key = JSON.stringify(body);
      if (key === editorKeyRef.current) return;
      editorKeyRef.current = key;
      editor.setContent(blocksToDoc(body, { labelFor: formatRef }));
    }, [body, editor]);

    // Theme the WebView content. Injected on load (and whenever the palette or
    // font scale changes) so the editor matches the app's variation.
    const injectTheme = useCallback(() => {
      editor.injectCSS(editorThemeCss(theme), "chlife-theme");
    }, [editor, theme]);

    useEffect(() => {
      injectTheme();
    }, [injectTheme]);

    return (
      <View style={[styles.root, { backgroundColor: colors.bg }]}>
        {header}
        <RichText
          editor={editor}
          onLoad={injectTheme}
          exclusivelyUseCustomOnMessage={false}
          onMessage={(event) => {
            // DIAGNOSTIC: surface web-editor errors (otherwise invisible
            // on-device) in the Metro logs. Bridge routing still runs because
            // exclusivelyUseCustomOnMessage is false.
            try {
              const data = JSON.parse(event.nativeEvent.data);
              if (data?.type === "web-error") {
                console.warn("[editor-web]", data.payload?.kind, data.payload?.detail);
              }
            } catch {
              // non-JSON messages are not ours; ignore.
            }
          }}
        />
        <EditorKeyboardToolbar editor={editor} onOpenBrowser={onOpenBrowser} />
      </View>
    );
  },
);

const styles = StyleSheet.create({
  root: { flex: 1 },
});
