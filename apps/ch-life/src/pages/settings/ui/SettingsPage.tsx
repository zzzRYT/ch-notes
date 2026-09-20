import React from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useSettingsStore, type Settings } from '@/features/settings/change';
import { useContactSupport } from '@/features/support/contact';
import { OTA_RELEASE } from '@/shared/config';
import {
  AppHeader,
  HeaderBack,
  VARIATION_OPTIONS,
  type AccentChoice,
  type BlockStyle,
  type FontFamily,
} from '@/shared/ui';

const PRIVACY_POLICY_URL = 'https://zzzryt.github.io/ch-notes/';

const FONT_OPTIONS: ReadonlyArray<{
  label: string;
  value: Settings['fontScale'];
}> = [
  { label: '보통', value: 1.0 },
  { label: '크게', value: 1.2 },
  { label: '더 크게', value: 1.4 },
  { label: '아주 크게', value: 1.6 },
];

const FONT_FAMILY_OPTIONS: ReadonlyArray<{
  label: string;
  value: FontFamily;
}> = [
  { label: 'Sans', value: 'sans' },
  { label: 'Serif', value: 'serif' },
  { label: 'Mono', value: 'mono' },
];

const BLOCK_STYLE_OPTIONS: ReadonlyArray<{
  label: string;
  value: BlockStyle;
}> = [
  { label: '변형별 기본값', value: 'default' },
  { label: '카드', value: 'card' },
  { label: '인용바', value: 'quote' },
  { label: '접힘', value: 'collapse' },
];

const ACCENT_SWATCHES: ReadonlyArray<{
  label: string;
  value: AccentChoice;
  swatch: string | null;
}> = [
  { label: '변형별 기본 색상', value: 'default', swatch: null },
  { label: '파랑', value: '#1e6fd9', swatch: '#1e6fd9' },
  { label: '갈색 (종이톤)', value: '#b15c2e', swatch: '#b15c2e' },
  { label: '녹색 (말씀)', value: '#1f8a5b', swatch: '#1f8a5b' },
  { label: '호박 (다크)', value: '#f5b35e', swatch: '#f5b35e' },
  { label: '보라', value: '#7a5af0', swatch: '#7a5af0' },
  { label: '슬레이트 (포커스)', value: '#6b7280', swatch: '#6b7280' },
];

export function SettingsPage() {
  const settings = useSettingsStore((s) => s.settings);
  const setSettings = useSettingsStore((s) => s.setSettings);

  const storeVersion = Constants.expoConfig?.version ?? '?';
  // 스토어 버전 + OTA 발행 번호. 번들만 갈아탄 기기도 어느 번들인지 보인다.
  const version = OTA_RELEASE > 0 ? `${storeVersion}+${OTA_RELEASE}` : storeVersion;
  const router = useRouter();
  const { openContact, showAddressFallback, supportEmail } =
    useContactSupport();

  const openPrivacyPolicy = async () => {
    try {
      await Linking.openURL(PRIVACY_POLICY_URL);
    } catch (e) {
      console.warn('failed to open privacy policy', e);
      Alert.alert('링크를 열 수 없습니다', PRIVACY_POLICY_URL);
    }
  };

  const renderChip = (
    label: string,
    selected: boolean,
    onPress: () => void,
  ) => (
    <Pressable
      key={label}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      className={`px-4 py-3 rounded-full min-h-touch justify-center ${
        selected ? 'bg-ink' : 'bg-chip-bg'
      }`}
    >
      <Text className={chipTextClass(selected)}>{label}</Text>
    </Pressable>
  );

  return (
    <View className="flex-1 bg-bg">
      <AppHeader
        left={<HeaderBack onPress={() => router.back()} />}
        title="설정"
        showRule
      />
      <ScrollView className="flex-1" contentContainerClassName="p-4 gap-2 pb-20">
        <View className={SECTION}>
          <Text className={SECTION_TITLE}>테마 (variation)</Text>
          <View className="gap-2">
            {VARIATION_OPTIONS.map((o) => {
              const selected = settings.variation === o.value;
              return (
                <Pressable
                  key={o.value}
                  onPress={() => setSettings({ variation: o.value })}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`${o.label} — ${o.hint}`}
                  className={`flex-row items-center justify-between px-3.5 py-3 rounded-10 border-hairline min-h-14 ${
                    selected
                      ? 'bg-accent-soft border-accent'
                      : 'bg-paper border-rule'
                  }`}
                >
                  <View className="gap-0.5">
                    <Text className="text-body font-semibold text-ink">
                      {o.label}
                    </Text>
                    <Text className="text-caption text-ink-3">{o.hint}</Text>
                  </View>
                  {selected && (
                    <Text className="text-accent font-semibold">✓</Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        <View className={SECTION}>
          <Text className={SECTION_TITLE}>글꼴 크기</Text>
          <View className={ROW}>
            {FONT_OPTIONS.map((o) =>
              renderChip(o.label, settings.fontScale === o.value, () =>
                setSettings({ fontScale: o.value }),
              ),
            )}
          </View>
        </View>

        <View className={SECTION}>
          <Text className={SECTION_TITLE}>폰트</Text>
          <View className={ROW}>
            {FONT_FAMILY_OPTIONS.map((o) =>
              renderChip(o.label, settings.fontFamily === o.value, () =>
                setSettings({ fontFamily: o.value }),
              ),
            )}
          </View>
        </View>

        <View className={SECTION}>
          <Text className={SECTION_TITLE}>성경 블록 스타일</Text>
          <View className={ROW}>
            {BLOCK_STYLE_OPTIONS.map((o) =>
              renderChip(o.label, settings.blockStyle === o.value, () =>
                setSettings({ blockStyle: o.value }),
              ),
            )}
          </View>
        </View>

        <View className={SECTION}>
          <Text className={SECTION_TITLE}>강조 색상</Text>
          <View className={ROW}>
            {ACCENT_SWATCHES.map((o) => {
              const selected = settings.accentChoice === o.value;
              return (
                <Pressable
                  key={o.value}
                  onPress={() => setSettings({ accentChoice: o.value })}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={o.label}
                  className={`flex-row items-center gap-2 px-3.5 py-2.5 rounded-full min-h-touch ${
                    selected ? 'bg-ink' : 'bg-chip-bg'
                  }`}
                >
                  {o.swatch && (
                    // 견본 색은 사용자 데이터(hex)라 토큰이 아니다 — style로 준다.
                    <View
                      className="size-3 rounded-6"
                      style={{ backgroundColor: o.swatch }}
                    />
                  )}
                  <Text className={chipTextClass(selected)}>{o.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View className={SECTION}>
          <Text className={SECTION_TITLE}>내보내기</Text>
          <Text className={`${HINT} text-ink-3`}>
            내보내기는 노트 화면 오른쪽 위의 ↑ 버튼을 사용하세요.
          </Text>
        </View>

        <View className={SECTION}>
          <Text className={SECTION_TITLE}>정보</Text>
          <Text className="text-ink">버전 {version}</Text>
          <Pressable
            onPress={() => router.push('/licenses')}
            accessibilityRole="button"
            accessibilityLabel="출처 및 라이선스"
            className={NAV_ROW}
          >
            <Text className={NAV_ROW_LABEL}>출처 및 라이선스</Text>
            <Text className={NAV_ROW_CHEVRON}>›</Text>
          </Pressable>
          <Pressable
            onPress={openPrivacyPolicy}
            accessibilityRole="link"
            accessibilityLabel="개인정보 처리방침 (웹페이지 열기)"
            className={NAV_ROW}
          >
            <Text className={NAV_ROW_LABEL}>개인정보 처리방침</Text>
            <Text className={NAV_ROW_CHEVRON}>↗</Text>
          </Pressable>
          <Pressable
            onPress={openContact}
            accessibilityRole="button"
            accessibilityLabel="문의하기 (메일 앱으로 문의 메일 작성)"
            className={NAV_ROW}
          >
            <Text className={NAV_ROW_LABEL}>문의하기</Text>
            <Text className={NAV_ROW_CHEVRON}>✉</Text>
          </Pressable>
          {showAddressFallback && (
            <View
              accessibilityRole="alert"
              className="gap-1.5 p-3 mt-2 rounded-10 border-hairline bg-chip-bg border-rule"
            >
              <Text className={`${HINT} text-ink-2`}>
                메일 앱을 열지 못했습니다. 아래 주소로 보내 주세요. 주소를 길게
                누르면 복사할 수 있습니다.
              </Text>
              <Text
                selectable
                accessibilityLabel={`문의 이메일 주소 ${supportEmail}`}
                className="text-body font-semibold text-ink"
              >
                {supportEmail}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const SECTION = 'gap-3 mb-5';
const SECTION_TITLE =
  'text-caption uppercase tracking-eyebrow font-semibold text-ink-3';
const ROW = 'flex-row flex-wrap gap-2';
const HINT = 'text-label leading-[1.46]';
const NAV_ROW =
  'flex-row items-center justify-between py-3 mt-1 min-h-12 border-t-hairline border-rule';
const NAV_ROW_LABEL = 'text-body text-ink';
// 글리프(› ↗ ✉)는 아이콘 — 고정 크기
const NAV_ROW_CHEVRON = 'text-[22px] text-ink-3';

function chipTextClass(selected: boolean): string {
  return `text-label ${selected ? 'text-paper font-semibold' : 'text-ink-2 font-normal'}`;
}
