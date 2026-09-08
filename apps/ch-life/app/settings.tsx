import React from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/state/app-store';
import { useTheme, VARIATION_OPTIONS } from '@/theme/ThemeProvider';
import { AppHeader } from '@/chrome/AppHeader';
import { HeaderBack } from '@/chrome/HeaderControls';
import { useContactSupport } from '@/support/use-contact-support';
import { OTA_RELEASE } from '@/version';
import type {
  AccentChoice,
  BlockStyle,
  FontFamily,
  Settings,
} from '@/domain/types';

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

export default function SettingsScreen() {
  const { colors } = useTheme();
  const settings = useAppStore((s) => s.settings);
  const setSettings = useAppStore((s) => s.setSettings);

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
      style={[
        styles.chip,
        {
          backgroundColor: selected ? colors.ink : colors.chipBg,
        },
      ]}
    >
      <Text
        style={[
          styles.chipText,
          {
            color: selected ? colors.paper : colors.ink2,
            fontWeight: selected ? '600' : '400',
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <AppHeader
        left={<HeaderBack onPress={() => router.back()} />}
        title="설정"
        showRule
      />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.root}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.ink3 }]}>
            테마 (variation)
          </Text>
          <View style={styles.col}>
            {VARIATION_OPTIONS.map((o) => {
              const selected = settings.variation === o.value;
              return (
                <Pressable
                  key={o.value}
                  onPress={() => setSettings({ variation: o.value })}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`${o.label} — ${o.hint}`}
                  style={[
                    styles.variationRow,
                    {
                      backgroundColor: selected
                        ? colors.accentSoft
                        : colors.paper,
                      borderColor: selected ? colors.accent : colors.rule,
                    },
                  ]}
                >
                  <View style={styles.variationLabels}>
                    <Text
                      style={[styles.variationLabel, { color: colors.ink }]}
                    >
                      {o.label}
                    </Text>
                    <Text
                      style={[styles.variationHint, { color: colors.ink3 }]}
                    >
                      {o.hint}
                    </Text>
                  </View>
                  {selected && (
                    <Text style={{ color: colors.accent, fontWeight: '600' }}>
                      ✓
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.ink3 }]}>
            글꼴 크기
          </Text>
          <View style={styles.row}>
            {FONT_OPTIONS.map((o) =>
              renderChip(o.label, settings.fontScale === o.value, () =>
                setSettings({ fontScale: o.value }),
              ),
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.ink3 }]}>
            폰트
          </Text>
          <View style={styles.row}>
            {FONT_FAMILY_OPTIONS.map((o) =>
              renderChip(o.label, settings.fontFamily === o.value, () =>
                setSettings({ fontFamily: o.value }),
              ),
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.ink3 }]}>
            성경 블록 스타일
          </Text>
          <View style={styles.row}>
            {BLOCK_STYLE_OPTIONS.map((o) =>
              renderChip(o.label, settings.blockStyle === o.value, () =>
                setSettings({ blockStyle: o.value }),
              ),
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.ink3 }]}>
            강조 색상
          </Text>
          <View style={styles.row}>
            {ACCENT_SWATCHES.map((o) => {
              const selected = settings.accentChoice === o.value;
              return (
                <Pressable
                  key={o.value}
                  onPress={() => setSettings({ accentChoice: o.value })}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={o.label}
                  style={[
                    styles.accentChip,
                    {
                      backgroundColor: selected ? colors.ink : colors.chipBg,
                    },
                  ]}
                >
                  {o.swatch && (
                    <View
                      style={[styles.swatchDot, { backgroundColor: o.swatch }]}
                    />
                  )}
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color: selected ? colors.paper : colors.ink2,
                        fontWeight: selected ? '600' : '400',
                      },
                    ]}
                  >
                    {o.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.ink3 }]}>
            내보내기
          </Text>
          <Text style={[styles.hint, { color: colors.ink3 }]}>
            내보내기는 노트 화면 오른쪽 위의 ↑ 버튼을 사용하세요.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.ink3 }]}>
            정보
          </Text>
          <Text style={{ color: colors.ink }}>버전 {version}</Text>
          <Pressable
            onPress={() => router.push('/licenses')}
            accessibilityRole="button"
            accessibilityLabel="출처 및 라이선스"
            style={[styles.navRow, { borderTopColor: colors.rule }]}
          >
            <Text style={[styles.navRowLabel, { color: colors.ink }]}>
              출처 및 라이선스
            </Text>
            <Text style={[styles.navRowChevron, { color: colors.ink3 }]}>
              ›
            </Text>
          </Pressable>
          <Pressable
            onPress={openPrivacyPolicy}
            accessibilityRole="link"
            accessibilityLabel="개인정보 처리방침 (웹페이지 열기)"
            style={[styles.navRow, { borderTopColor: colors.rule }]}
          >
            <Text style={[styles.navRowLabel, { color: colors.ink }]}>
              개인정보 처리방침
            </Text>
            <Text style={[styles.navRowChevron, { color: colors.ink3 }]}>
              ↗
            </Text>
          </Pressable>
          <Pressable
            onPress={openContact}
            accessibilityRole="button"
            accessibilityLabel="문의하기 (메일 앱으로 문의 메일 작성)"
            style={[styles.navRow, { borderTopColor: colors.rule }]}
          >
            <Text style={[styles.navRowLabel, { color: colors.ink }]}>
              문의하기
            </Text>
            <Text style={[styles.navRowChevron, { color: colors.ink3 }]}>
              ✉
            </Text>
          </Pressable>
          {showAddressFallback && (
            <View
              accessibilityRole="alert"
              style={[
                styles.fallbackBox,
                { backgroundColor: colors.chipBg, borderColor: colors.rule },
              ]}
            >
              <Text style={[styles.hint, { color: colors.ink2 }]}>
                메일 앱을 열지 못했습니다. 아래 주소로 보내 주세요. 주소를 길게
                누르면 복사할 수 있습니다.
              </Text>
              <Text
                selectable
                accessibilityLabel={`문의 이메일 주소 ${supportEmail}`}
                style={[styles.fallbackAddress, { color: colors.ink }]}
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

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { flex: 1 },
  root: { padding: 16, gap: 8, paddingBottom: 80 },
  section: { gap: 12, marginBottom: 20 },
  sectionTitle: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontWeight: '600',
  },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  col: { gap: 8 },
  variationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 56,
  },
  variationLabels: { gap: 2 },
  variationLabel: { fontSize: 15, fontWeight: '600' },
  variationHint: { fontSize: 12 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 999,
    minHeight: 44,
    justifyContent: 'center',
  },
  chipText: { fontSize: 14 },
  accentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    minHeight: 44,
  },
  swatchDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  hint: { fontSize: 13, lineHeight: 19 },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    marginTop: 4,
    minHeight: 48,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  navRowLabel: { fontSize: 15 },
  navRowChevron: { fontSize: 22 },
  fallbackBox: {
    gap: 6,
    padding: 12,
    marginTop: 8,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
  fallbackAddress: { fontSize: 16, fontWeight: '600' },
});
