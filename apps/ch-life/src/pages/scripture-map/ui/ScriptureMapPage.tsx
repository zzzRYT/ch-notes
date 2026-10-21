import React, { useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, Text, useWindowDimensions, View } from "react-native";
import { useRouter } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { formatRef } from "@/entities/scripture";
import {
  MAP_DATA,
  buildRegions,
  summarize,
  type PeriodFilter,
  type PlaceView,
  type RegionView,
  type ViewNote,
} from "@/features/scripture/map";
import { TABLET_BREAKPOINT } from "@/shared/lib";
import { AppHeader, Button, HeaderBack, useTheme } from "@/shared/ui";
import {
  OverviewMap,
  RegionMap,
  type Glyph,
  type OverviewRegion,
  type RegionPlace,
} from "@/widgets/scripture-map";
import { useScriptureMap } from "../model/useScriptureMap";

const PRECISION_LABEL = {
  site: "유적 일대의 한 점",
  city: "도시 주변의 대략적인 위치",
  area: "일대의 대략적인 위치",
} as const;

// RN 타입에는 없지만 iOS 스크롤 뷰가 읽는 prop이다. 안 읽는 버전이어도 무해하다.
const IOS_NO_TOUCH_DELAY = { delaysContentTouches: false } as object;

const periodName = (v: PlaceView) => v.period?.name ?? "시대 미상";

/** 시대 순서대로 ◆ ■ ●. 시대 미상은 ●. 시대는 색이 아니라 모양으로 구분한다. */
const GLYPHS: Glyph[] = ["diamond", "square", "circle"];
const glyphOf = (v: PlaceView): Glyph => GLYPHS[((v.period?.order ?? 3) - 1) % GLYPHS.length]!;

function regionSubtitle(r: RegionView) {
  const periods = new Set(r.places.map((p) => p.place.periodId));
  const head = periods.size > 1 ? `${periods.size}시대` : periodName(r.places[0]!);
  return `${head} · ${r.noteCount}편`;
}

function formatDate(ts: number) {
  const d = new Date(ts);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}.${mm}.${dd}`;
}

export function ScriptureMapPage() {
  const router = useRouter();
  // 넓은 화면에서는 지도와 목록을 나란히 둔다. 기능·집계는 폰과 같다.
  const wide = useWindowDimensions().width >= TABLET_BREAKPOINT;
  const { state, retry } = useScriptureMap(MAP_DATA);
  // 선택은 화면에 남겨 둔다. 노트를 열었다 돌아와도 필터·지역·장소가 유지된다(R6).
  const [period, setPeriod] = useState<PeriodFilter>(undefined);
  const [regionKey, setRegionKey] = useState<string | null>(null);
  const [placeId, setPlaceId] = useState<string | null>(null);
  // 폰에서는 지도 아래에 상세가 붙는다. 지역을 고르면 상세가 보이도록 스크롤한다.
  const scrollRef = useRef<ScrollView>(null);
  // 지도에 손가락이 닿아 있는 동안 페이지 스크롤을 잠가, 지도를 끌 때 페이지가 같이 움직이지 않게 한다.
  const [mapTouching, setMapTouching] = useState(false);
  const layoutY = useRef({ block: 0, detail: 0 });

  const ready = state.status === "ready" ? state : null;
  const notes = useMemo<ViewNote[]>(() => ready?.notes ?? [], [ready]);
  const links = useMemo(() => ready?.links ?? [], [ready]);
  const regions = useMemo(
    () => buildRegions(links, notes, MAP_DATA, period),
    [links, notes, period],
  );

  // 삭제·시대 변경으로 사라진 선택은 해제한다(AE8). 장소는 지역이 있어야만 유효하다.
  const region = regions.find((r) => r.key === regionKey) ?? null;
  const place = region?.places.find((p) => p.place.id === placeId) ?? null;

  const changePeriod = (next: PeriodFilter) => {
    setPeriod(next);
    const stillThere = buildRegions(links, notes, MAP_DATA, next).find((r) => r.key === regionKey);
    if (!stillThere) setRegionKey(null);
    if (!stillThere?.places.some((p) => p.place.id === placeId)) setPlaceId(null);
  };

  const totalLinked = summarize(links, MAP_DATA).noteCount;
  const { noteCount, regionCount } = summarize(links, MAP_DATA, period);
  const hasUnknownPeriod = MAP_DATA.places.some((p) => p.periodId === null);

  const periodOptions: { label: string; value: PeriodFilter }[] = [
    { label: "전체", value: undefined },
    ...[...MAP_DATA.periods]
      .sort((a, b) => a.order - b.order)
      .map((p) => ({ label: p.name, value: p.id })),
    ...(hasUnknownPeriod ? [{ label: "시대 미상", value: null }] : []),
  ];

  const backToNotes = () => router.back();

  const selectRegion = (key: string | null) => {
    setRegionKey(key);
    setPlaceId(null);
    if (key && !wide) {
      const { block, detail } = layoutY.current;
      scrollRef.current?.scrollTo({ y: block + detail - 8, animated: true });
    }
  };

  let body: React.ReactNode;
  if (state.status === "loading") {
    body = <Message title="불러오는 중…" />;
  } else if (state.status === "error") {
    body = (
      <Message title="기록을 불러오지 못했어요.">
        <Button label="다시 시도" onPress={retry} />
      </Message>
    );
  } else if (notes.length === 0) {
    body = (
      <Message
        title="말씀의 배경을 기록으로 남겨보세요"
        description="설교 본문이나 인용 구절을 기록하면, 연결할 수 있는 장소가 지도에 표시돼요."
      >
        <Button label="노트로 돌아가기" onPress={backToNotes} />
      </Message>
    );
  } else if (totalLinked === 0) {
    body = (
      <Message
        title="아직 지도에 연결된 기록이 없어요"
        description="일부 본문부터 지도에 연결돼요. 작성한 노트는 그대로 남아 있어요."
      >
        <Button label="노트로 돌아가기" onPress={backToNotes} />
      </Message>
    );
  } else {
    body = (
      <>
        <View className="px-5.5 pt-3 pb-4 gap-1">
          <Text className="font-extrabold tracking-[-0.5px] text-ink text-display">
            말씀 지도
          </Text>
          <Text className="text-ink text-body-large font-semibold" accessibilityLiveRegion="polite">
            {noteCount}편의 기록 · {regionCount}지역
          </Text>
          <Text className="text-ink-3 text-label">기록한 말씀의 배경을 따라 돌아보세요.</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="px-5.5 gap-2 pb-4"
          accessibilityLabel="사건 시대 필터"
        >
          {periodOptions.map((o) => (
            <Button
              key={o.label}
              label={o.label}
              selected={period === o.value}
              onPress={() => changePeriod(o.value)}
            />
          ))}
        </ScrollView>
        <View
          className={wide ? "flex-row items-start" : undefined}
          onLayout={(e) => (layoutY.current.block = e.nativeEvent.layout.y)}
        >
          {regions.length > 0 ? (
            <MapSection
              wide={wide}
              regions={regions}
              selectedKey={region?.key ?? null}
              onSelectRegion={selectRegion}
              onTouching={setMapTouching}
            />
          ) : null}
          <View className="flex-1" onLayout={(e) => (layoutY.current.detail = e.nativeEvent.layout.y)}>
            {regions.length === 0 ? (
              <Message title="이 시대에 연결된 기록이 없어요">
                <Button label="전체 시대 보기" onPress={() => changePeriod(undefined)} />
              </Message>
            ) : region ? (
              <RegionDetail
                region={region}
                place={place}
                onBack={() => selectRegion(null)}
                onSelectPlace={setPlaceId}
                onTouching={setMapTouching}
                onOpenNote={(id) =>
                  router.push({ pathname: "/note/[id]", params: { id, from: "scripture-map" } })
                }
              />
            ) : (
              <View>
                {regions.map((r) => (
                  <Row
                    key={r.key}
                    title={r.name}
                    subtitle={regionSubtitle(r)}
                    onPress={() => selectRegion(r.key)}
                  />
                ))}
                <Text className="px-5.5 pt-4 text-ink-3 text-caption">
                  {notes.length > totalLinked
                    ? `전체 기록 ${notes.length}편 중 ${totalLinked}편이 지도에 연결돼 있어요. `
                    : ""}
                  일부 본문부터 지도에 연결돼요.
                </Text>
              </View>
            )}
          </View>
        </View>
      </>
    );
  }

  return (
    <View className="flex-1 bg-bg">
      <AppHeader
        left={<HeaderBack label="노트" onPress={backToNotes} />}
        title="말씀 지도"
        showRule
      />
      <ScrollView
        ref={scrollRef}
        className="flex-1"
        contentContainerClassName="pb-20"
        scrollEnabled={!mapTouching}
        // iOS는 스크롤 뷰가 터치를 150ms 붙들어, 그동안 지도 제스처보다 페이지 스크롤이 먼저 시작된다.
        {...IOS_NO_TOUCH_DELAY}
      >
        {body}
        <Pressable
          onPress={() => router.push("/licenses")}
          accessibilityRole="link"
          accessibilityLabel="지도 안내와 출처 및 라이선스 열기"
          className="px-5.5 pt-4 min-h-touch justify-center self-start"
        >
          <Text className="text-accent text-label font-semibold">지도 안내 · 출처 및 라이선스 ›</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function Message({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <View className="items-center px-5.5 pt-20 gap-3">
      <Text className="text-body-large font-semibold text-ink text-center">{title}</Text>
      {description ? (
        <Text className="text-label text-ink-3 text-center">{description}</Text>
      ) : null}
      {children}
    </View>
  );
}

function Row({
  title,
  subtitle,
  onPress,
}: {
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${subtitle}`}
      className="flex-row items-center px-5.5 py-3.5 min-h-touch gap-3 border-t-hairline border-rule active:opacity-60"
    >
      <View className="flex-1 gap-[3px]">
        <Text numberOfLines={2} className="font-semibold text-ink text-body-large">
          {title}
        </Text>
        <Text numberOfLines={1} className="text-ink-3 text-label">
          {subtitle}
        </Text>
      </View>
      <ChevronRight size={18} color={colors.ink3} strokeWidth={1.8} />
    </Pressable>
  );
}

function BackLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label} 화면으로 돌아가기`}
      className="px-5.5 min-h-touch justify-center"
    >
      <Text className="text-accent text-label font-semibold">‹ {label}</Text>
    </Pressable>
  );
}

function RegionDetail({
  region,
  place,
  onBack,
  onSelectPlace,
  onOpenNote,
  onTouching,
}: {
  region: RegionView;
  place: PlaceView | null;
  onBack: () => void;
  onSelectPlace: (placeId: string | null) => void;
  onOpenNote: (id: string) => void;
  onTouching: (touching: boolean) => void;
}) {
  const periods = new Set(region.places.map((p) => p.place.periodId)).size;
  const mapPlaces = useMemo<RegionPlace[]>(
    () =>
      region.places.map((v) => ({
        id: v.place.id,
        // 지도 라벨은 짧게: 괄호 속 유적 이름은 아래 목록에서 읽는다.
        name: v.place.name.replace(/\s*\(.*?\)/g, ""),
        lat: v.place.lat,
        lon: v.place.lon,
        glyph: glyphOf(v),
        periodName: v.period?.name ?? "",
      })),
    [region],
  );
  return (
    <View>
      {place ? (
        <BackLink label={region.name} onPress={() => onSelectPlace(null)} />
      ) : (
        <BackLink label="전체 지역" onPress={onBack} />
      )}
      <View className="px-5.5 pb-3 gap-1">
        <Text className="font-bold text-ink text-title">{region.name}</Text>
        <Text className="text-ink-3 text-label">
          {periods}시대의 장소 · {region.noteCount}편의 기록
        </Text>
      </View>
      {/* 지역이 바뀌면 새로 만들어 처음 위치로 돌린다. 장소를 골라도 유지돼 선택 표식만 바뀐다. */}
      <RegionMap
        key={region.key}
        places={mapPlaces}
        focusId={place?.place.id ?? null}
        onFocus={onSelectPlace}
        onTouching={onTouching}
      />
      <View className="pt-2">
        {place ? (
          <PlaceDetail view={place} onOpenNote={onOpenNote} />
        ) : (
          region.places.map((v) => (
            <Row
              key={v.place.id}
              title={v.place.name}
              subtitle={`${periodName(v)} · 노트 ${v.notes.length}편`}
              onPress={() => onSelectPlace(v.place.id)}
            />
          ))
        )}
      </View>
    </View>
  );
}

function PlaceDetail({ view, onOpenNote }: { view: PlaceView; onOpenNote: (id: string) => void }) {
  const { place } = view;
  return (
    <View>
      <View className="px-5.5 pb-4 gap-1.5">
        <Text className="font-bold text-ink text-title">{place.name}</Text>
        <Text className="text-ink-2 text-label font-semibold">{periodName(view)}</Text>
        <Text className="text-ink-3 text-caption">{PRECISION_LABEL[place.precision]}</Text>
        <Text className="text-ink-2 text-label">{place.locationNote}</Text>
        <Text className="text-ink-3 text-caption">
          지도의 위치는 본문 배경을 이해하기 위한 참고 정보예요.
        </Text>
      </View>
      {view.notes.map(({ note, refs }) => {
        // 요약 조회는 본문을 싣지 않으므로 제목이 없으면 고정 문구를 쓴다.
        const title = note.title?.trim() || "제목 없는 노트";
        const sub = `${formatDate(note.createdAt)} · ${refs.map(formatRef).join(", ")}`;
        return (
          <Row key={note.id} title={title} subtitle={sub} onPress={() => onOpenNote(note.id)} />
        );
      })}
    </View>
  );
}

function MapSection({
  wide,
  regions,
  selectedKey,
  onSelectRegion,
  onTouching,
}: {
  wide: boolean;
  regions: RegionView[];
  selectedKey: string | null;
  onSelectRegion: (key: string | null) => void;
  onTouching: (touching: boolean) => void;
}) {
  // 지도의 표식과 아래 목록은 같은 선택 상태를 쓴다. 표식은 목록의 다른 입구일 뿐이다.
  // 지역 표식은 그 지역 장소들의 평균 위치에 둔다.
  const overview = useMemo<OverviewRegion[]>(
    () =>
      regions.map((r) => {
        const mean = (f: (v: PlaceView) => number) => r.places.reduce((s, v) => s + f(v), 0) / r.places.length;
        return {
          key: r.key,
          name: r.name,
          lat: mean((v) => v.place.lat),
          lon: mean((v) => v.place.lon),
          noteCount: r.noteCount,
          periodCount: new Set(r.places.map((v) => v.place.periodId)).size,
        };
      }),
    [regions],
  );
  return (
    // 나란히 놓을 때는 지도 폭(480 + 좌우 여백)을 고정한다.
    <View className="pb-4" style={wide ? { width: 524 } : undefined}>
      <OverviewMap
        regions={overview}
        selectedKey={selectedKey}
        onSelect={onSelectRegion}
        onTouching={onTouching}
        height={wide ? 520 : 400}
      />
      <Text className="px-5.5 pt-2 text-ink-3 text-caption">
        지도의 위치는 본문 배경을 이해하기 위한 참고 정보예요. 끌어서 옮기고 두 손가락으로 키울 수 있어요.
      </Text>
    </View>
  );
}
