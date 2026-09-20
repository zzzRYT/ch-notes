import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { makeQuoteBlock } from "@/entities/note";
import {
  BUNDLED_EDITION_ID,
  lookupVerses,
  suggestBooks,
} from "@/entities/scripture";
import { QuoteBlock } from "@/widgets/note-editor";

type Props = {
  citedRefs: ReadonlyArray<string>;
  onInsert: (ref: string) => void;
  onCollapse: () => void;
  hideHeader?: boolean;
};

const RECENT_REFS = [
  "요 3:16",
  "시 23:1-4",
  "마 5:3-12",
  "롬 8:28",
  "빌 4:13",
  "엡 2:8-10",
];

export function BibleLookupPanel({
  citedRefs,
  onInsert,
  onCollapse,
  hideHeader,
}: Props) {
  const [query, setQuery] = useState("");
  const trimmed = query.trim();

  const resolved = useMemo(() => {
    if (!trimmed) return null;
    const verses = lookupVerses(trimmed);
    return verses ? { ref: trimmed, verses } : null;
  }, [trimmed]);

  const suggestions = useMemo(
    () => (resolved ? [] : suggestBooks(trimmed)),
    [resolved, trimmed],
  );

  const showCited = !trimmed;
  const showEmpty = trimmed && !resolved;

  return (
    <View className="flex-1 bg-paper">
      {!hideHeader && (
        <View className="flex-row items-center justify-between px-4 py-3 border-b-hairline border-rule">
          <Text className="text-body font-semibold text-ink">성경 보기</Text>
          <Pressable
            onPress={onCollapse}
            accessibilityRole="button"
            accessibilityLabel="성경 보기 접기"
            hitSlop={10}
            className="size-7 items-center justify-center rounded-6"
          >
            <Text className="text-[18px] text-ink-2">›</Text>
          </Pressable>
        </View>
      )}
      <View className="flex-row items-center gap-2 mx-3 mt-3 px-3 rounded-8 min-h-10 bg-chip-bg">
        <Text className="text-[14px] text-ink-3">⌕</Text>
        <TextInput
          className="flex-1 py-2 text-ink text-label"
          value={query}
          onChangeText={setQuery}
          placeholder="창1:1 · 시 23 · 마5:3-12"
          placeholderTextColorClassName="text-ink-3"
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          accessibilityLabel="성경 참조 검색"
        />
        {!!query && (
          <Pressable
            onPress={() => setQuery("")}
            accessibilityRole="button"
            accessibilityLabel="검색어 지우기"
            hitSlop={6}
            className="size-[22px] items-center justify-center"
          >
            <Text className="text-[12px] text-ink-3">✕</Text>
          </Pressable>
        )}
      </View>
      {suggestions.length > 0 && (
        <View className="flex-row flex-wrap px-3 pt-2.5 gap-1.5">
          {suggestions.map((b) => (
            <Pressable
              key={b.code}
              onPress={() => setQuery(`${b.shortKo} `)}
              accessibilityRole="button"
              accessibilityLabel={`${b.fullKo} 책 선택`}
              className="flex-row items-baseline gap-1.5 px-2.5 py-1.5 rounded-full bg-chip-bg"
            >
              <Text className="font-semibold text-caption text-ink">
                {b.shortKo}
              </Text>
              <Text className="text-caption text-ink-3">{b.fullKo}</Text>
            </Pressable>
          ))}
        </View>
      )}
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-3 gap-2 pb-10"
        keyboardShouldPersistTaps="handled"
      >
        {resolved && (
          <View className="gap-2">
            <Text className={SECTION_LABEL}>검색 결과</Text>
            <QuoteBlock
              {...makeQuoteBlock(
                resolved.ref,
                resolved.verses,
                BUNDLED_EDITION_ID,
              )}
            />
            <Pressable
              onPress={() => {
                onInsert(resolved.ref);
                setQuery("");
              }}
              accessibilityRole="button"
              accessibilityLabel="노트에 인용 삽입"
              className="flex-row justify-center items-center px-3 py-2.5 rounded-8 border-hairline border-accent"
            >
              <Text className="font-semibold text-label text-accent">
                ＋ 노트에 삽입
              </Text>
            </Pressable>
          </View>
        )}
        {showEmpty && (
          <View className="py-3 gap-1">
            <Text className="text-label font-semibold text-ink-2">
              참조를 인식하지 못했어요
            </Text>
            <Text className={EMPTY_HINT}>예: 창1:1 · 창세기 1:1-5 · 시 23</Text>
          </View>
        )}
        {showCited && (
          <View>
            <View className="flex-row items-center gap-2 mb-1">
              <Text className={SECTION_LABEL}>현재 노트의 인용</Text>
              <View className="px-[7px] py-0.5 rounded-full bg-chip-bg">
                <Text className="text-caption font-semibold text-ink-3">
                  {citedRefs.length}
                </Text>
              </View>
            </View>
            {citedRefs.length === 0 && (
              <Text className={EMPTY_HINT}>
                아직 인용이 없습니다. 본문에 창1:1 처럼 입력해 보세요.
              </Text>
            )}
            {citedRefs.map((ref) => {
              const verses = lookupVerses(ref);
              if (!verses) return null;
              return (
                <QuoteBlock
                  key={ref}
                  {...makeQuoteBlock(ref, verses, BUNDLED_EDITION_ID)}
                />
              );
            })}
            <Text className={`${SECTION_LABEL} mt-[18px]`}>최근</Text>
            <View className="flex-row flex-wrap gap-1.5">
              {RECENT_REFS.map((r) => (
                <Pressable
                  key={r}
                  onPress={() => setQuery(r)}
                  accessibilityRole="button"
                  accessibilityLabel={`${r} 검색`}
                  className="px-2.5 py-1.5 rounded-full bg-chip-bg"
                >
                  <Text className="text-caption font-medium text-ink-2">{r}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const SECTION_LABEL =
  "text-caption uppercase tracking-eyebrow font-semibold mb-1 text-ink-3";
const EMPTY_HINT = "text-caption text-ink-3";
