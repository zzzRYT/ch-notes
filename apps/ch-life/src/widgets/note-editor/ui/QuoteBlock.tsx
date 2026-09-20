import React, { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import type { CitationVerse, QuoteBlockNode } from "@/entities/note";
import { formatRef } from "@/entities/scripture";
import { useTheme } from "@/shared/ui";

type Props = QuoteBlockNode;

export function QuoteBlock(props: Props) {
  const { blockStyle } = useTheme();
  const refLabel = formatRef(props.ref);
  switch (blockStyle) {
    case "quote":
      return <QuoteVariant {...props} refLabel={refLabel} />;
    case "collapse":
      return <CollapseVariant {...props} refLabel={refLabel} />;
    case "card":
    default:
      return <CardVariant {...props} refLabel={refLabel} />;
  }
}

type VariantProps = Props & { refLabel: string };

const LABEL_CLASS = "text-accent text-caption font-semibold";

function HeaderLabel({
  refLabel,
  prefixDot = true,
}: {
  refLabel: string;
  prefixDot?: boolean;
}) {
  return (
    <View className="flex-row items-center gap-2 mb-1.5">
      {prefixDot && <View className="size-1.5 rounded-3 bg-accent" />}
      <Text className={LABEL_CLASS}>{refLabel}</Text>
    </View>
  );
}

function Body({
  verses,
  status,
}: {
  verses: CitationVerse[];
  status: Props["status"];
}) {
  const { colors } = useTheme();
  if (status === "loading") {
    return (
      <View className="flex-row items-center gap-2">
        <ActivityIndicator size="small" color={colors.ink3} />
        <Text className="text-ink-3">불러오는 중…</Text>
      </View>
    );
  }
  if (status === "error") {
    return <Text className="text-err-text">본문을 찾을 수 없습니다</Text>;
  }
  // 행간은 실측값(primitives.js) — 절 번호 1.82, 인용 본문 1.6
  return (
    <>
      {verses.map((v) => (
        <View
          key={`${v.book}-${v.chapter}-${v.verse}`}
          className="flex-row gap-2 mt-0.5"
        >
          <Text className="min-w-4 pt-0.5 font-semibold text-left text-ink-3 text-caption leading-[1.82]">
            {v.verse}
          </Text>
          <Text className="flex-1 text-ink font-body text-body leading-[1.6]">
            {v.text}
          </Text>
        </View>
      ))}
    </>
  );
}

function CardVariant({ verses, status, refLabel }: VariantProps) {
  return (
    <View
      className={`my-2.5 border-hairline rounded-12 p-3.5 bg-paper ${
        status === "error" ? "border-err-bar" : "border-rule"
      }`}
      accessibilityRole="text"
      accessibilityLabel={`인용 ${refLabel}`}
    >
      <HeaderLabel refLabel={refLabel} />
      <Body verses={verses} status={status} />
    </View>
  );
}

function QuoteVariant({ verses, status, refLabel }: VariantProps) {
  return (
    <View
      className="flex-row my-2.5 rounded-8 overflow-hidden bg-accent-soft"
      accessibilityRole="text"
      accessibilityLabel={`인용 ${refLabel}`}
    >
      <View className="w-[3px] bg-accent" />
      <View className="flex-1 px-3.5 py-3">
        <HeaderLabel refLabel={refLabel} prefixDot={false} />
        <Body verses={verses} status={status} />
      </View>
    </View>
  );
}

function CollapseVariant({ verses, status, refLabel }: VariantProps) {
  const [open, setOpen] = useState(true);
  return (
    <View
      className="my-2 rounded-10 border-hairline border-rule overflow-hidden bg-bg"
      accessibilityRole="text"
      accessibilityLabel={`인용 ${refLabel}`}
    >
      <Pressable
        onPress={() => setOpen((v) => !v)}
        accessibilityRole="button"
        accessibilityLabel={`${refLabel} ${open ? "접기" : "펼치기"}`}
        accessibilityState={{ expanded: open }}
        className="flex-row items-center gap-2 px-3 py-2.5 min-h-9"
      >
        <Text className="font-semibold w-3 text-center text-accent text-caption">
          {open ? "▾" : "▸"}
        </Text>
        <Text className={LABEL_CLASS}>{refLabel}</Text>
      </Pressable>
      {open && (
        <View className="px-3 pb-3 gap-1">
          <Body verses={verses} status={status} />
        </View>
      )}
    </View>
  );
}
