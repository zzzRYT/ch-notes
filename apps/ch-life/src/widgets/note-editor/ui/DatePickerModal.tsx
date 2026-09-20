import React, { useMemo, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import {
  addMonths,
  buildMonthGrid,
  parseYmd,
  todayYmd,
} from "../lib/calendar";

type Props = {
  visible: boolean;
  value: string | null; // YYYY-MM-DD
  onSelect: (ymd: string) => void;
  onClose: () => void;
};

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

export function DatePickerModal({ visible, value, onSelect, onClose }: Props) {
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
      <Pressable
        className="flex-1 bg-black/35 items-center justify-center p-6"
        onPress={onClose}
      >
        <Pressable
          className="w-full max-w-[360px] rounded-16 p-4 bg-paper"
          onPress={(e) => e.stopPropagation()}
        >
          <View className="flex-row items-center justify-between mb-2">
            <Pressable
              onPress={() => goMonth(-1)}
              accessibilityRole="button"
              accessibilityLabel="이전 달"
              hitSlop={12}
              className={NAV_BTN}
            >
              <Text className={NAV_GLYPH}>‹</Text>
            </Pressable>
            <Text className="font-bold text-ink font-body text-body-large">
              {view.year}년 {view.month0 + 1}월
            </Text>
            <Pressable
              onPress={() => goMonth(1)}
              accessibilityRole="button"
              accessibilityLabel="다음 달"
              hitSlop={12}
              className={NAV_BTN}
            >
              <Text className={NAV_GLYPH}>›</Text>
            </Pressable>
          </View>

          <View className="flex-row">
            {WEEKDAYS.map((w) => (
              <Text
                key={w}
                className={`${COL} text-center text-caption py-1 text-ink-3`}
              >
                {w}
              </Text>
            ))}
          </View>

          <View className="flex-row flex-wrap">
            {grid.map((ymd, i) => {
              if (!ymd) return <View key={`pad-${i}`} className={CELL} />;
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
                  className={CELL}
                >
                  <View
                    className={`size-full rounded-full items-center justify-center ${
                      selected
                        ? "bg-accent"
                        : isToday
                          ? "border-[1.5px] border-accent"
                          : ""
                    }`}
                  >
                    <Text
                      className={`text-body ${
                        selected
                          ? "text-accent-text font-bold"
                          : isToday
                            ? "text-accent font-bold"
                            : "text-ink font-normal"
                      }`}
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
            className="self-center mt-2 p-3"
          >
            <Text className="text-label font-semibold text-accent">오늘</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// 7열 그리드. 글리프 ‹ › 는 아이콘이라 fontScale을 타지 않는다(icon/glyph 계열).
const COL = "w-[14.2857%]";
const CELL = `${COL} aspect-square items-center justify-center p-0.5`;
const NAV_BTN = "size-touch items-center justify-center";
const NAV_GLYPH = "text-[24px] text-ink-2";
