import React from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useSettingsStore } from '@/features/settings/change';
import { useContactSupport } from '@/features/support/contact';
import { OTA_RELEASE, VARIATION_OPTIONS } from '@/shared/config';
import { AppHeader, HeaderBack, SettingRow } from '@/shared/ui';

const PRIVACY_POLICY_URL = 'https://zzzryt.github.io/ch-notes/';

export function SettingsPage() {
  const settings = useSettingsStore((s) => s.settings);
  const themeLabel = VARIATION_OPTIONS.find((o) => o.value === settings.variation)?.label;

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

  return (
    <View className="flex-1 bg-bg">
      <AppHeader
        left={<HeaderBack onPress={() => router.back()} />}
        title="설정"
        showRule
      />
      <ScrollView className="flex-1" contentContainerClassName="p-4 gap-2 pb-20">
        <View className={SECTION}>
          <SettingRow
            label="테마 변경"
            description={`${themeLabel} · 배경, 글자, 인용 모양, 강조색`}
            marker="›"
            onPress={() => router.push('/settings/theme')}
          />
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
const HINT = 'text-label leading-[1.46]';
