import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import type { Note } from "@/domain/types";
import { noteFileName, noteToMarkdown } from "@/markdown/serialize";

export async function exportNote(note: Note): Promise<void> {
  const dir = FileSystem.cacheDirectory;
  if (!dir) throw new Error("cacheDirectory unavailable");
  const md = noteToMarkdown(note);
  const path = `${dir}${noteFileName(note)}`;
  await FileSystem.writeAsStringAsync(path, md, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(path, {
      mimeType: "text/markdown",
      dialogTitle: "노트 공유",
      UTI: "net.daringfireball.markdown",
    });
  }
}
