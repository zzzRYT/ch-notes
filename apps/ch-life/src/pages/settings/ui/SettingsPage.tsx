import React from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import {
  FONT_SCALE_OPTIONS,
  useSettingsStore,
} from '@/features/settings/change';
import { useContactSupport } from '@/features/support/contact';
import {
  ACCENT_OPTIONS,
  BLOCK_STYLE_OPTIONS,
  FONT_FAMILY_OPTIONS,
  OTA_RELEASE,
  VARIATION_OPTIONS,
} from '@/shared/config';
import { AppHeader, Button, HeaderBack, SettingRow } from '@/shared/ui';

const PRIVACY_POLICY_URL = 'https://zzzryt.github.io/ch-notes/';

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
    <Button
      key={label}
      label={label}
      selected={selected}
      onPress={onPress}
    />
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
                <SettingRow
                  key={o.value}
                  label={o.label}
                  description={o.hint}
                  selected={selected}
                  onPress={() => setSettings({ variation: o.value })}
                  accessibilityLabel={`${o.label} — ${o.hint}`}
                />
              );
            })}
          </View>
        </View>

        <View className={SECTION}>
          <Text className={SECTION_TITLE}>글꼴 크기</Text>
          <View className={ROW}>
            {FONT_SCALE_OPTIONS.map((o) =>
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
            {ACCENT_OPTIONS.map((o) => {
              const selected = settings.accentChoice === o.value;
              const swatch = o.value === 'default' ? null : o.value;
              return (
                <Button
                  key={o.value}
                  label={o.label}
                  selected={selected}
                  onPress={() => setSettings({ accentChoice: o.value })}
                  leading={swatch ? (
                    // 견본 색은 사용자 데이터(hex)라 토큰이 아니다 — style로 준다.
                    <View
                      className="size-3 shrink-0 rounded-6"
                      style={{ backgroundColor: swatch }}
                    />
                  ) : null}
                />
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
          <SettingRow
            label="출처 및 라이선스"
            marker="›"
            onPress={() => router.push('/licenses')}
          />
          <SettingRow
            label="개인정보 처리방침"
            marker="↗"
            onPress={openPrivacyPolicy}
            accessibilityRole="link"
            accessibilityLabel="개인정보 처리방침 (웹페이지 열기)"
          />
          <SettingRow
            label="문의하기"
            marker="✉"
            onPress={openContact}
            accessibilityRole="button"
            accessibilityLabel="문의하기 (메일 앱으로 문의 메일 작성)"
          />
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
