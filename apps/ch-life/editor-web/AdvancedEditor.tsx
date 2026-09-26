import React from "react";
import { EditorContent } from "@tiptap/react";
import { useTenTap, TenTapStartKit } from "@10play/tentap-editor";
import { VerseQuoteBridge } from "../src/widgets/note-editor/lib/verse-bridge";
import { DocSyncBridge } from "../src/widgets/note-editor/lib/doc-sync-bridge";
import { CaretBottomRoom, HardwareFormatKeys, SlashMenu, UnderlineInputRule } from "./extensions";

const bridges = [...TenTapStartKit, VerseQuoteBridge, DocSyncBridge];
const tiptapOptions = { extensions: [SlashMenu, UnderlineInputRule, HardwareFormatKeys, CaretBottomRoom] };

export const AdvancedEditor = () => {
  const editor = useTenTap({ bridges, tiptapOptions });
  return (
    <EditorContent
      editor={editor}
      className={window.dynamicHeight ? "dynamic-height" : undefined}
    />
  );
};
