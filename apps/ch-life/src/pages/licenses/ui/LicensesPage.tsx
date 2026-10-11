import React from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { MAP_DATA } from "@/features/scripture/map";
import { AppHeader, HeaderBack } from "@/shared/ui";

const BIBLE_SOURCE_URL = "https://www.openbible.uk";
const BIBLE_LICENSE_URL =
  "https://creativecommons.org/licenses/by-sa/4.0/deed.ko";
const GEO_SOURCE_URL = "https://www.openbible.info/geo/";
const GEO_LICENSE_URL = "https://creativecommons.org/licenses/by/4.0/deed.ko";
const TERRAIN_SOURCE_URL = "https://www.naturalearthdata.com/about/terms-of-use/";

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
        <View className="gap-3 mb-5">
          <Text className="text-caption uppercase tracking-eyebrow font-semibold text-ink-3">
            말씀 지도
          </Text>
          <Text className="text-label leading-[1.5] text-ink">
            말씀 지도는 저장한 설교 본문과 인용 구절을, 미리 검토해 앱에 넣어 둔 일부
            본문의 사건 배경에 연결합니다. 모두 이 기기 안에서 이루어지며 노트 내용은
            밖으로 나가지 않습니다.
          </Text>
          {GUIDE.map((line) => (
            <Text key={line} className="text-label leading-[1.46] text-ink-3">
              · {line}
            </Text>
          ))}
          <Text className="text-label font-semibold text-ink">장소 위치와 이름</Text>
          <Text className="text-label leading-[1.5] text-ink">
            <Text className="font-semibold">OpenBible.info 성경 지리 데이터</Text>
            (CC BY 4.0)에서 가져온 위치를 바탕으로, 장소를 골라 한국어 이름과 위치
            설명을 덧붙였습니다. 사진과 지도 도형은 가져오지 않았습니다.
          </Text>
          <Pressable
            onPress={() => openUrl(GEO_SOURCE_URL)}
            accessibilityRole="link"
            accessibilityLabel="OpenBible 성경 지리 데이터 웹사이트 열기"
            className={LINK_ROW}
          >
            <Text className={LINK}>openbible.info/geo</Text>
          </Pressable>
          <Pressable
            onPress={() => openUrl(GEO_LICENSE_URL)}
            accessibilityRole="link"
            accessibilityLabel="CC BY 4.0 라이선스 전문 열기"
            className={LINK_ROW}
          >
            <Text className={LINK}>CC BY 4.0 라이선스</Text>
          </Pressable>
          <Text className="text-label font-semibold text-ink">지형</Text>
          <Text className="text-label leading-[1.5] text-ink">
            <Text className="font-semibold">Natural Earth</Text>의 해안선·호수(공개 영역,
            1:10m)를 지도 범위로 잘라 단순화했습니다. 현대의 지형이며 고대의 해안선이나
            국경이 아닙니다.
          </Text>
          <Pressable
            onPress={() => openUrl(TERRAIN_SOURCE_URL)}
            accessibilityRole="link"
            accessibilityLabel="Natural Earth 이용 조건 열기"
            className={LINK_ROW}
          >
            <Text className={LINK}>naturalearthdata.com</Text>
          </Pressable>
          <Text className="text-label font-semibold text-ink">수록한 장소</Text>
          {MAP_DATA.places.map((p) => (
            <Text key={p.id} selectable className="text-caption leading-[1.5] text-ink-3">
              {p.regionName} · {p.name}
              {"\n"}
              {p.source}
            </Text>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const LINK_ROW = "min-h-touch justify-center";
const LINK = "text-body font-medium underline text-accent";

const GUIDE = [
  "시대는 성경 사건이 일어난 시대이며, 노트를 쓴 날이나 성경 책이 기록된 때가 아닙니다.",
  "같은 지역에도 시대마다 다른 장소가 있을 수 있어 시대별로 나누어 보여 줍니다.",
  "지도의 위치는 본문 배경을 이해하기 위한 참고 정보이며, 정확한 사건 지점을 보증하지 않습니다. 장소마다 위치 설명에 불확실성을 적었습니다.",
  "장소와 시대가 확인된 일부 본문부터 연결됩니다. 연결되지 않은 노트도 그대로 남아 있습니다.",
];
