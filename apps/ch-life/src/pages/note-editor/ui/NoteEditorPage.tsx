import React, { useCallback, useRef, useState } from 'react';
import { Keyboard, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BookOpen, Share, Trash2 } from 'lucide-react-native';
import { useNoteRepo } from '@/entities/note';
import { deleteNoteWithUndo } from '@/features/note/delete';
import { exportNote } from '@/features/note/export';
import { showFeedback } from '@/shared/lib';
import {
  AppHeader,
  HeaderBack,
  HeaderIconButton,
  HeaderTextButton,
} from '@/shared/ui';
import {
  NoteEditor,
  SermonMetaHeader,
  useNoteDraft,
  type NoteEditorHandle,
} from '@/widgets/note-editor';
import { BibleBrowser } from '@/widgets/scripture-browser';

export function NoteEditorPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const repo = useNoteRepo();
  const [browserOpen, setBrowserOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const editorRef = useRef<NoteEditorHandle>(null);
  const deletingRef = useRef(false);

  const draft = useNoteDraft({
    repo,
    noteId: id ?? null,
    enabled: !deleting,
    saveErrorMessage: '저장 실패. 다시 시도 중...',
  });
  const {
    status,
    title,
    body,
    sermonDate,
    preacher,
    location,
    scripture,
    saveErr,
    setSaveErr,
    flush: flushAutoSave,
    insertRef: insertVerseFromBrowser,
    snapshot,
  } = draft;

  const handleExport = useCallback(async () => {
    if (!id) return;
    try {
      const fresh = await repo.findById(id);
      if (!fresh) return;
      await exportNote({ ...fresh, ...snapshot() });
    } catch (e) {
      console.warn('export failed', e);
      setSaveErr('공유 실패');
    }
  }, [repo, id, snapshot, setSaveErr]);

  const handleDelete = useCallback(async () => {
    if (!id || deletingRef.current) return;
    deletingRef.current = true;
    try {
      await flushAutoSave();
    } catch (error) {
      console.warn('pre-delete save failed', error);
      showFeedback({
        message: '노트를 삭제하지 못했습니다',
        tone: 'error',
        durationMs: 3000,
      });
      deletingRef.current = false;
      return;
    }

    setDeleting(true);
    const deleted = await deleteNoteWithUndo(repo, id);
    if (deleted) router.replace('/');
    else {
      deletingRef.current = false;
      setDeleting(false);
    }
  }, [repo, id, flushAutoSave, router]);

  // 불러오는 동안은 빈 화면 — 옛 값이 잠깐 보였다 바뀌지 않게 한다.
  if (status === 'idle' || status === 'loading') return null;
  return (
    <View className="flex-1 bg-bg">
      <AppHeader
        left={<HeaderBack label="노트" onPress={() => router.back()} />}
        right={
          <>
            <HeaderIconButton
              icon={BookOpen}
              label="성경 읽기"
              onPress={() => setBrowserOpen(true)}
            />
            <HeaderIconButton
              icon={Share}
              label="노트 공유"
              onPress={handleExport}
            />
            <HeaderIconButton
              icon={Trash2}
              label="현재 노트 삭제"
              tint="error"
              onPress={handleDelete}
            />
            <HeaderTextButton label="완료" onPress={() => Keyboard.dismiss()} />
          </>
        }
      />
      {saveErr && (
        <View className="p-2 bg-err-bg">
          <Text className="text-err-text">{saveErr}</Text>
        </View>
      )}
      <NoteEditor
        ref={editorRef}
        body={body}
        onChangeBody={draft.setBody}
        header={
          <SermonMetaHeader
            title={title}
            sermonDate={sermonDate}
            preacher={preacher}
            location={location}
            scripture={scripture}
            onChangeTitle={draft.setTitle}
            onChangeSermonDate={draft.setSermonDate}
            onChangePreacher={draft.setPreacher}
            onChangeLocation={draft.setLocation}
            onChangeScripture={draft.setScripture}
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

