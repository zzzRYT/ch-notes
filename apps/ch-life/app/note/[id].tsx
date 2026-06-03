import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Keyboard, Text, View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Share } from 'lucide-react-native';
import { SermonMetaHeader } from '@/editor/SermonMetaHeader';
import { useAutoSave } from '@/editor/useAutoSave';
import { BibleBrowser } from '@/browser/BibleBrowser';
import { lookupVerses } from '@/parser/verse-lookup';
import { openNoteRepo } from '@/db/expo-adapter';
import { useAppStore } from '@/state/app-store';
import { exportNote } from '@/share/export-note';
import { extractCitedRefs } from '@/editor/cited-refs';
import { useTheme } from '@/theme/ThemeProvider';
import { AppHeader } from '@/chrome/AppHeader';
import {
  HeaderBack,
  HeaderIconButton,
  HeaderTextButton,
} from '@/chrome/HeaderControls';
import type { BlockNode } from '@/domain/types';
import { NoteEditor, type NoteEditorHandle } from '@/editor/NoteEditor';

export default function NoteEditorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const [title, setTitle] = useState<string | null>(null);
  const [sermonDate, setSermonDate] = useState<string | null>(null);
  const [preacher, setPreacher] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [scripture, setScripture] = useState<string | null>(null);
  const [body, setBody] = useState<BlockNode[]>([
    { type: 'paragraph', text: '' },
  ]);
  const [ready, setReady] = useState(false);
  const [saveErr, setSaveErr] = useState<string | null>(null);
  const [browserOpen, setBrowserOpen] = useState(false);
  const editorRef = useRef<NoteEditorHandle>(null);

  const handleExport = useCallback(async () => {
    if (!id) return;
    try {
      const repo = await openNoteRepo();
      const fresh = await repo.findById(id);
      if (!fresh) return;
      await exportNote({
        ...fresh,
        body,
        title,
        sermonDate,
        preacher,
        location,
        scripture,
        citedRefs: extractCitedRefs(body),
      });
    } catch (e) {
      console.warn('export failed', e);
      setSaveErr('공유 실패');
    }
  }, [id, body, title, sermonDate, preacher, location, scripture]);

  const handleChangeTitle = useCallback((next: string | null) => {
    setTitle(next);
  }, []);

  const insertVerseFromBrowser = useCallback((ref: string) => {
    const verses = lookupVerses(ref);
    if (!verses) return;
    setBody((b) => [
      ...b,
      { type: 'quote', ref, verses, status: 'loaded' },
      { type: 'paragraph', text: '' },
    ]);
  }, []);

  useEffect(() => {
    if (!id) return;
    useAppStore.getState().setCurrentNoteId(id);
    return () => {
      const cur = useAppStore.getState().currentNoteId;
      if (cur === id) useAppStore.getState().setCurrentNoteId(null);
    };
  }, [id]);

  useEffect(() => {
    if (!ready) return;
    const pending = useAppStore.getState().consumePendingInsert();
    if (!pending) return;
    insertVerseFromBrowser(pending);
  }, [ready, insertVerseFromBrowser]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      const repo = await openNoteRepo();
      const note = await repo.findById(id);
      if (cancelled) return;
      if (note) {
        setTitle(note.title);
        setSermonDate(note.sermonDate);
        setPreacher(note.preacher);
        setLocation(note.location);
        setScripture(note.scripture);
        setBody(
          note.body.length ? note.body : [{ type: 'paragraph', text: '' }],
        );
      }
      setReady(true);
    })().catch((e) => {
      console.warn('load failed', e);
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const save = useCallback(
    async (patch: {
      title: string | null;
      body: BlockNode[];
      citedRefs: string[];
      sermonDate: string | null;
      preacher: string | null;
      location: string | null;
      scripture: string | null;
    }) => {
      if (!id) return;
      const repo = await openNoteRepo();
      await repo.update(id, patch);
      setSaveErr(null);
    },
    [id],
  );

  const onError = useMemo(
    () => (e: unknown) => {
      console.warn('autosave failed', e);
      setSaveErr('저장 실패. 다시 시도 중...');
    },
    [],
  );

  useAutoSave({
    title,
    body,
    sermonDate,
    preacher,
    location,
    scripture,
    save,
    onError,
  });

  if (!ready) return null;
  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <AppHeader
        left={<HeaderBack label="노트" onPress={() => router.back()} />}
        right={
          <>
            <HeaderIconButton
              icon={Share}
              label="노트 공유"
              onPress={handleExport}
            />
            <HeaderTextButton label="완료" onPress={() => Keyboard.dismiss()} />
          </>
        }
      />
      {saveErr && (
        <View style={[styles.errBanner, { backgroundColor: colors.errBg }]}>
          <Text style={{ color: colors.errText }}>{saveErr}</Text>
        </View>
      )}
      <NoteEditor
        ref={editorRef}
        body={body}
        onChangeBody={setBody}
        header={
          <SermonMetaHeader
            title={title}
            sermonDate={sermonDate}
            preacher={preacher}
            location={location}
            scripture={scripture}
            onChangeTitle={handleChangeTitle}
            onChangeSermonDate={setSermonDate}
            onChangePreacher={setPreacher}
            onChangeLocation={setLocation}
            onChangeScripture={setScripture}
            onSubmitLast={() => editorRef.current?.focusFirstParagraph()}
          />
        }
      />
      <BibleBrowser
        visible={browserOpen}
        onClose={() => setBrowserOpen(false)}
        onInsertVerse={insertVerseFromBrowser}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  errBanner: { padding: 8 },
});
