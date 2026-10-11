import React, { useCallback, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BookOpen, Share, Trash2 } from 'lucide-react-native';
import { useNoteRepo } from '@/entities/note';
import { confirmNoteDelete, deleteNoteWithUndo } from '@/features/note/delete';
import { exportNote } from '@/features/note/export';
import { showFeedback } from '@/shared/lib';
import { AppHeader, HeaderBack, HeaderIconButton } from '@/shared/ui';
import {
  EditorSkeleton,
  NoteEditor,
  SermonMetaHeader,
  saveLive,
  useNoteDraft,
  type NoteEditorHandle,
} from '@/widgets/note-editor';
import { BibleBrowser } from '@/widgets/scripture-browser';
import { useSaveBeforeLeave } from '../model/useSaveBeforeLeave';

export function NoteEditorPage() {
  const { id, from } = useLocalSearchParams<{ id: string; from?: string }>();
  // 말씀 지도에서 연 에디터는 돌아갈 곳을 헤더에 보인다.
  const backLabel = from === 'scripture-map' ? '말씀 지도' : '노트';
  const router = useRouter();
  const repo = useNoteRepo();
  const [browserOpen, setBrowserOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const editorRef = useRef<NoteEditorHandle>(null);
  const deletingRef = useRef(false);
  // 삭제한 노트는 떠날 때 다시 저장하면 안 된다.
  const deletedRef = useRef(false);

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

  const deleteNote = useCallback(async () => {
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
    if (deleted) {
      deletedRef.current = true;
      router.back();
    }
    else {
      deletingRef.current = false;
      setDeleting(false);
    }
  }, [repo, id, flushAutoSave, router]);

  const handleDelete = useCallback(
    () => confirmNoteDelete(() => void deleteNote()),
    [deleteNote],
  );

  // 버튼·기기 뒤로·제스처 어느 쪽으로 떠나도 마지막 입력까지 저장한 뒤에 떠난다.
  // 실패하면 이 화면에 남아 기존 오류 표현을 보인다.
  useSaveBeforeLeave(
    () => saveLive(draft, editorRef),
    (e) => {
      console.warn('save before leave failed', e);
      setSaveErr('저장하지 못해 나가지 않았어요. 다시 시도해 주세요.');
    },
    deletedRef,
  );

  // 불러오는 동안은 스켈레톤 — 옛 값이 잠깐 보였다 바뀌지 않게 하고, 빈 화면이 번쩍이지도 않게 한다.
  const loading = status === 'idle' || status === 'loading';
  return (
    <View className="flex-1 bg-bg">
      <AppHeader
        left={<HeaderBack label={backLabel} onPress={() => router.back()} />}
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
          </>
        }
      />
      {saveErr && (
        <View className="p-2 bg-err-bg">
          <Text className="text-err-text">{saveErr}</Text>
        </View>
      )}
      {loading ? (
        <EditorSkeleton withMeta />
      ) : (
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
      )}
      <BibleBrowser
        visible={browserOpen}
        onClose={() => setBrowserOpen(false)}
        onInsertVerse={insertVerseFromBrowser}
      />
    </View>
  );
}
