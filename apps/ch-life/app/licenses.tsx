import React from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as Linking from "expo-linking";
import { useTheme } from "@/theme/ThemeProvider";

const BIBLE_SOURCE_URL = "https://www.openbible.uk";
const BIBLE_LICENSE_URL =
  "https://creativecommons.org/licenses/by-sa/4.0/deed.ko";

export default function LicensesScreen() {
  const { colors } = useTheme();

  const openUrl = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (e) {
      console.warn("failed to open url", url, e);
      Alert.alert("링크를 열 수 없습니다", url);
    }
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={styles.root}
    >
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.ink3 }]}>
          성경 본문
        </Text>
        <Text style={[styles.body, { color: colors.ink }]}>
          이 앱의 성경 본문은{" "}
          <Text style={styles.bold}>Open Bible 한국어판</Text>을 사용하며,
          원문에서 본문을 추출·편집하여 수록했습니다.
        </Text>
        <Pressable
          onPress={() => openUrl(BIBLE_SOURCE_URL)}
          accessibilityRole="link"
          accessibilityLabel="Open Bible 웹사이트 열기"
          style={styles.linkRow}
        >
          <Text style={[styles.link, { color: colors.accent }]}>
            openbible.uk
          </Text>
        </Pressable>
        <Pressable
          onPress={() => openUrl(BIBLE_LICENSE_URL)}
          accessibilityRole="link"
          accessibilityLabel="CC BY-SA 4.0 라이선스 전문 열기"
          style={styles.linkRow}
        >
          <Text style={[styles.link, { color: colors.accent }]}>
            CC BY-SA 4.0 라이선스
          </Text>
        </Pressable>
        <Text style={[styles.hint, { color: colors.ink3 }]}>
          본문은 CC BY-SA 4.0 조건에 따라 자유롭게 이용·공유할 수 있으며, 본문을
          수정한 2차적 저작물도 동일한 라이선스로 배포됩니다.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { padding: 16, gap: 8, paddingBottom: 80 },
  section: { gap: 12, marginBottom: 20 },
  sectionTitle: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    fontWeight: "600",
  },
  body: { fontSize: 14, lineHeight: 21 },
  bold: { fontWeight: "600" },
  hint: { fontSize: 13, lineHeight: 19 },
  link: { fontSize: 15, fontWeight: "500", textDecorationLine: "underline" },
  linkRow: { minHeight: 44, justifyContent: "center" },
});
