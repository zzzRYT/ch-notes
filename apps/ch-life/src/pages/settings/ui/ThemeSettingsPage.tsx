import React from 'react';
import { Platform, ScrollView, Text, View } from 'react-native';
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

// 폰·태블릿 모두 같은 한 열 레이아웃이다. 견본은 행 앞의 작은 칩이다.
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
      <ScrollView className="flex-1" contentContainerClassName="p-4 gap-5 pb-8">
        <Text className="text-label text-ink-2">선택하면 바로 적용됩니다.</Text>

        <View className="gap-3">
          <Text className={TITLE}>화면 배경</Text>
          {VARIATION_OPTIONS.map((o) => {
            const candidate = resolveTheme({ ...settings, variation: o.value });
            return (
              <SettingRow
                key={o.value}
                label={o.label}
                accessibilityHint={o.hint}
                selected={settings.variation === o.value}
                onPress={() => setSettings({ variation: o.value })}
                leading={
                  <View className="size-8 rounded-8 border-hairline items-center justify-center"
                    style={{ backgroundColor: candidate.colors.bg, borderColor: theme.colors.ink4 }}
                    accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
                    <Text style={{ color: candidate.colors.ink, fontSize: 16 }}>가</Text>
                  </View>
                }
              />
            );
          })}
        </View>

        <View className="gap-3">
          <Text className={TITLE}>글자 크기</Text>
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
          <View className={ROW}>
            {FONT_FAMILY_OPTIONS.map((o) => (
              <Button key={o.value} label={o.label} selected={settings.fontFamily === o.value}
                onPress={() => setSettings({ fontFamily: o.value })}
                leading={<Text className={settings.fontFamily === o.value ? 'text-paper text-body' : 'text-ink text-body'}
                  style={{ fontFamily: previewFont(resolveTheme({ ...settings, fontFamily: o.value })) }}>Aa</Text>} />
            ))}
          </View>
        </View>

        <View className="gap-3">
          <Text className={TITLE}>성경 인용 모양</Text>
          {BLOCK_STYLE_OPTIONS.map((o) => {
            const candidate = resolveTheme({ ...settings, blockStyle: o.value });
            return <SettingRow key={o.value} label={o.label} accessibilityHint={o.hint}
              selected={settings.blockStyle === o.value}
              onPress={() => setSettings({ blockStyle: o.value })}
              leading={
                <View className="size-8 rounded-8 items-center justify-center"
                  style={{ backgroundColor: candidate.blockStyle === 'quote' ? theme.colors.accentSoft : theme.colors.paper,
                    borderColor: candidate.blockStyle === 'quote' ? theme.colors.accent : theme.colors.ink4,
                    borderWidth: candidate.blockStyle === 'quote' ? 0 : 1,
                    borderLeftWidth: candidate.blockStyle === 'quote' ? 3 : 1 }}
                  accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
                  <Text style={{ color: theme.colors.accent, fontSize: 14 }}>{candidate.blockStyle === 'collapse' ? '▾' : '가'}</Text>
                </View>
              } />;
          })}
        </View>

        <View className="gap-3">
          <Text className={TITLE}>강조색</Text>
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

const TITLE = 'text-body font-semibold text-ink';
const ROW = 'flex-row flex-wrap gap-2';
