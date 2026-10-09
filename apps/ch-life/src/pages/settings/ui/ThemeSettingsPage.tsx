import React, { useState } from 'react';
import { Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { FONT_SCALE_OPTIONS, useSettingsStore } from '@/features/settings/change';
import {
  ACCENT_OPTIONS,
  BLOCK_STYLE_OPTIONS,
  FONT_FAMILY_OPTIONS,
  VARIATION_OPTIONS,
} from '@/shared/config';
import {
  AppHeader,
  Button,
  HeaderBack,
  resolveTheme,
  scaled,
  SettingRow,
  type Theme,
} from '@/shared/ui';

export function ThemeSettingsPage() {
  const settings = useSettingsStore((s) => s.settings);
  const setSettings = useSettingsStore((s) => s.setSettings);
  const router = useRouter();
  const theme = resolveTheme(settings);

  return (
    <View className="flex-1 bg-bg">
      <AppHeader
        left={<HeaderBack onPress={() => router.back()} />}
        title="테마 변경"
        showRule
      />
      <ScrollView className="flex-1" contentContainerClassName="p-4 gap-8 pb-20">
        <View className="gap-3">
          <Text className="text-label text-ink-2">선택하면 바로 적용됩니다.</Text>
          <NotePreview theme={theme} />
        </View>

        <View className="gap-3">
          <Text className={TITLE}>화면 배경</Text>
          {VARIATION_OPTIONS.map((o) => {
            const candidate = resolveTheme({ ...settings, variation: o.value });
            return (
              <SettingRow
                key={o.value}
                label={o.label}
                description={o.hint}
                selected={settings.variation === o.value}
                onPress={() => setSettings({ variation: o.value })}
                preview={
                  <View
                    className="gap-2 rounded-8 p-3 border-hairline"
                    style={{ backgroundColor: candidate.colors.bg, borderColor: candidate.colors.rule }}
                    accessible={false}
                    importantForAccessibility="no-hide-descendants"
                    accessibilityElementsHidden
                  >
                    <Text className="text-body font-semibold" style={{ color: candidate.colors.ink }}>주일 설교</Text>
                    <Text className="text-label" style={{ color: candidate.colors.accent }}>오늘 마음에 남은 말씀</Text>
                  </View>
                }
              />
            );
          })}
        </View>

        <View className="gap-3">
          <Text className={TITLE}>글자 크기</Text>
          <Text className={HINT}>위 예시에서 읽기 편한 크기를 확인하세요.</Text>
          <View className={ROW}>
            {FONT_SCALE_OPTIONS.map((o) => (
              <Button key={o.value} label={o.label} selected={settings.fontScale === o.value}
                onPress={() => setSettings({ fontScale: o.value })}
                leading={<Text style={{ fontSize: scaled(15, o.value) }} className={settings.fontScale === o.value ? 'text-paper' : 'text-ink'}>가</Text>} />
            ))}
          </View>
        </View>

        <View className="gap-3">
          <Text className={TITLE}>글꼴</Text>
          <Text className={HINT}>노트 본문의 글꼴을 바꿉니다. 기기에 따라 모양이 다를 수 있습니다.</Text>
          <View className={ROW}>
            {FONT_FAMILY_OPTIONS.map((o) => (
              <Button key={o.value} label={o.label} selected={settings.fontFamily === o.value}
                onPress={() => setSettings({ fontFamily: o.value })}
                leading={<Text className={settings.fontFamily === o.value ? 'text-paper text-body' : 'text-ink text-body'}
                  style={{ fontFamily: previewFont(resolveTheme({ ...settings, fontFamily: o.value })) }}>가 Aa</Text>} />
            ))}
          </View>
        </View>

        <View className="gap-3">
          <Text className={TITLE}>성경 인용 모양</Text>
          {BLOCK_STYLE_OPTIONS.map((o) => (
            <SettingRow key={o.value} label={o.label} description={o.hint}
              selected={settings.blockStyle === o.value}
              onPress={() => setSettings({ blockStyle: o.value })}
              preview={<QuotePreview theme={resolveTheme({ ...settings, blockStyle: o.value })} />} />
          ))}
        </View>

        <View className="gap-3">
          <Text className={TITLE}>강조색</Text>
          <Text className={HINT}>성경 참조와 선택 표시 등에 쓰는 색입니다.</Text>
          <View className={ROW}>
            {ACCENT_OPTIONS.map((o) => (
              <Button key={o.value} label={o.label} selected={settings.accentChoice === o.value}
                onPress={() => setSettings({ accentChoice: o.value })}
                leading={
                  <View className="size-3 rounded-full border-hairline border-ink-4"
                    style={{ backgroundColor: resolveTheme({ ...settings, accentChoice: o.value }).colors.accent }} />
                } />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// shortcut: 네이티브 견본은 기기 기본 서체다, 한글 폰트 번들링 시 본문과 같은 폰트로 맞춘다.
function previewFont(theme: Theme): string | undefined {
  if (Platform.OS === 'web') return theme.fontStack;
  if (theme.fontStack.startsWith('Noto Serif')) return Platform.OS === 'ios' ? 'Georgia' : 'serif';
  if (theme.fontStack.startsWith('JetBrains')) return Platform.OS === 'ios' ? 'Menlo' : 'monospace';
  return undefined;
}

function NotePreview({ theme }: { theme: Theme }) {
  // 견본은 현재 화면과 다른 테마도 그리므로 계산된 토큰을 직접 쓴다.
  return (
    <View className="gap-3 rounded-12 border-hairline p-4"
      style={{ backgroundColor: theme.colors.bg, borderColor: theme.colors.rule }}>
      <Text className="text-caption" style={{ color: theme.colors.ink2 }}>미리보기</Text>
      <Text className="text-title font-semibold" style={{ color: theme.colors.ink }}>주일 설교</Text>
      <Text testID="theme-preview-body" style={{ color: theme.colors.ink,
        fontFamily: previewFont(theme), fontSize: scaled(17, theme.fontScale), lineHeight: scaled(17, theme.fontScale) * 1.6 }}>
        오늘 들은 말씀을 기억하고, 삶 속에서 실천할 일을 적어 봅니다.
      </Text>
      <QuotePreview key={theme.blockStyle} theme={theme} interactive />
    </View>
  );
}

function QuotePreview({ theme, interactive = false }: { theme: Theme; interactive?: boolean }) {
  const { colors, blockStyle } = theme;
  const [open, setOpen] = useState(true);
  const label = <Text className="text-label font-semibold" style={{ color: colors.accent }}>
    {blockStyle === 'collapse' ? (open ? '▾ ' : '▸ ') : ''}시편 23:1
  </Text>;
  return (
    <View className="gap-2 rounded-8 p-3"
      style={{ backgroundColor: blockStyle === 'quote' ? colors.accentSoft : colors.paper,
        borderColor: blockStyle === 'quote' ? colors.accent : colors.rule,
        borderWidth: blockStyle === 'quote' ? 0 : 1,
        borderLeftWidth: blockStyle === 'quote' ? 3 : 1 }}>
      {interactive && blockStyle === 'collapse' ? (
        <Pressable onPress={() => setOpen(!open)} accessibilityRole="button"
          accessibilityLabel={`미리보기 구절 ${open ? '접기' : '펼치기'}`}
          accessibilityState={{ expanded: open }} className="min-h-touch justify-center">
          {label}
        </Pressable>
      ) : label}
      {(blockStyle !== 'collapse' || open) && <Text style={{ color: colors.ink, fontFamily: previewFont(theme),
        fontSize: scaled(17, theme.fontScale), lineHeight: scaled(17, theme.fontScale) * 1.6 }}>
        여호와는 나의 목자시니 내가 부족함이 없으리로다
      </Text>}
    </View>
  );
}

const TITLE = 'text-body font-semibold text-ink';
const HINT = 'text-label leading-[1.6] text-ink-2';
const ROW = 'flex-row flex-wrap gap-2';
