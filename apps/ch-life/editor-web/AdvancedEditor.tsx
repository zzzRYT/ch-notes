import React from "react";
import { EditorContent } from "@tiptap/react";
import { useTenTap, TenTapStartKit } from "@10play/tentap-editor";
import { VerseQuoteBridge } from "../src/editor/richdoc/verseBridge";

declare global {
  interface Window {
    dynamicHeight?: boolean;
  }
}

export const AdvancedEditor = () => {
  const editor = useTenTap({
    bridges: [...TenTapStartKit, VerseQuoteBridge],
  });

  return (
    <EditorContent
      editor={editor}
      className={window.dynamicHeight ? "dynamic-height" : undefined}
    />
  );
};
