import React, { useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme, scaled } from "@/theme/ThemeProvider";
import {
  addMonths,
  buildMonthGrid,
  parseYmd,
  todayYmd,
} from "./calendar";

type Props = {
  visible: boolean;
  value: string | null; // YYYY-MM-DD
  onSelect: (ymd: string) => void;
  onClose: () => void;
};

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

export function DatePickerModal({ visible, value, onSelect, onClose }: Props) {
  const { colors, fontScale, fontStack } = useTheme();
  const initial = parseYmd(value ?? "") ?? parseYmd(todayYmd())!;
  const [view, setView] = useState({
    year: initial.getFullYear(),
    month0: initial.getMonth(),
  });

  const grid = useMemo(
    () => buildMonthGrid(view.year, view.month0),
    [view.year, view.month0],
  );

  const goMonth = (delta: number) =>
    setView((v) => addMonths(v.year, v.month0, delta));

  const today = todayYmd();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { backgroundColor: colors.paper }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.head}>
            <Pressable
              onPress={() => goMonth(-1)}
              accessibilityRole="button"
              accessibilityLabel="이전 달"
              hitSlop={12}
              style={styles.navBtn}
            >
              <Text style={[styles.navText, { color: colors.ink2 }]}>‹</Text>
            </Pressable>
            <Text
              style={[
                styles.headTitle,
                { color: colors.ink, fontFamily: fontStack, fontSize: scaled(17, fontScale) },
              ]}
            >
              {view.year}년 {view.month0 + 1}월
            </Text>
            <Pressable
              onPress={() => goMonth(1)}
              accessibilityRole="button"
              accessibilityLabel="다음 달"
              hitSlop={12}
              style={styles.navBtn}
            >
              <Text style={[styles.navText, { color: colors.ink2 }]}>›</Text>
            </Pressable>
          </View>

          <View style={styles.weekRow}>
            {WEEKDAYS.map((w) => (
              <Text key={w} style={[styles.weekday, { color: colors.ink3 }]}>
                {w}
              </Text>
            ))}
          </View>

          <View style={styles.grid}>
            {grid.map((ymd, i) => {
              if (!ymd) return <View key={`pad-${i}`} style={styles.cell} />;
              const day = Number(ymd.slice(8, 10));
              const selected = ymd === value;
              const isToday = ymd === today;
              return (
                <Pressable
                  key={ymd}
                  onPress={() => {
                    onSelect(ymd);
                    onClose();
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={isToday ? `${day}일 오늘` : `${day}일`}
                  style={styles.cell}
                >
                  <View
                    style={[
                      styles.cellInner,
                      isToday &&
                        !selected && {
                          borderWidth: 1.5,
                          borderColor: colors.accent,
                        },
                      selected && { backgroundColor: colors.accent },
                    ]}
                  >
                    <Text
                      style={{
                        color: selected
                          ? colors.accentText
                          : isToday
                            ? colors.accent
                            : colors.ink,
                        fontSize: scaled(15, fontScale),
                        fontWeight: selected || isToday ? "700" : "400",
                      }}
                    >
                      {day}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            onPress={() => {
              onSelect(todayYmd());
              onClose();
            }}
            accessibilityRole="button"
            accessibilityLabel="오늘 선택"
            style={styles.todayBtn}
          >
            <Text style={[styles.todayText, { color: colors.accent }]}>오늘</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const COLS = 7;
const COL_WIDTH = `${100 / COLS}%` as const;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  sheet: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 16,
    padding: 16,
  },
  head: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  headTitle: { fontWeight: "700" },
  navBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  navText: { fontSize: 24 },
  weekRow: { flexDirection: "row" },
  weekday: {
    width: COL_WIDTH,
    textAlign: "center",
    fontSize: 12,
    paddingVertical: 4,
  },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cell: {
    width: COL_WIDTH,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 2,
  },
  cellInner: {
    width: "100%",
    height: "100%",
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  todayBtn: { alignSelf: "center", marginTop: 8, padding: 12 },
  todayText: { fontSize: 14, fontWeight: "600" },
});
