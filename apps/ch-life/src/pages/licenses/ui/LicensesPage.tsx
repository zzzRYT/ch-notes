import React from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { AppHeader, HeaderBack } from "@/shared/ui";

const BIBLE_SOURCE_URL = "https://www.openbible.uk";
const BIBLE_LICENSE_URL =
  "https://creativecommons.org/licenses/by-sa/4.0/deed.ko";

export function LicensesPage() {
  const router = useRouter();

  const openUrl = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (e) {
      console.warn("failed to open url", url, e);
      Alert.alert("링크를 열 수 없습니다", url);
    }
  };

  return (
    <View className="flex-1 bg-bg">
      <AppHeader
        left={<HeaderBack onPress={() => router.back()} />}
        title="출처 및 라이선스"
        showRule
      />
      <ScrollView className="flex-1" contentContainerClassName="p-4 gap-2 pb-20">
        <View className="gap-3 mb-5">
          <Text className="text-caption uppercase tracking-eyebrow font-semibold text-ink-3">
            성경 본문
          </Text>
          <Text className="text-label leading-[1.5] text-ink">
            이 앱의 성경 본문은{" "}
            <Text className="font-semibold">Open Bible 한국어판</Text>을 사용하며,
            원문에서 본문을 추출·편집하여 수록했습니다.
          </Text>
          <Pressable
            onPress={() => openUrl(BIBLE_SOURCE_URL)}
            accessibilityRole="link"
            accessibilityLabel="Open Bible 웹사이트 열기"
            className={LINK_ROW}
          >
            <Text className={LINK}>openbible.uk</Text>
          </Pressable>
          <Pressable
            onPress={() => openUrl(BIBLE_LICENSE_URL)}
            accessibilityRole="link"
            accessibilityLabel="CC BY-SA 4.0 라이선스 전문 열기"
            className={LINK_ROW}
          >
            <Text className={LINK}>CC BY-SA 4.0 라이선스</Text>
          </Pressable>
          <Text className="text-label leading-[1.46] text-ink-3">
            본문은 CC BY-SA 4.0 조건에 따라 자유롭게 이용·공유할 수 있으며, 본문을
            수정한 2차적 저작물도 동일한 라이선스로 배포됩니다.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const LINK_ROW = "min-h-touch justify-center";
const LINK = "text-body font-medium underline text-accent";
