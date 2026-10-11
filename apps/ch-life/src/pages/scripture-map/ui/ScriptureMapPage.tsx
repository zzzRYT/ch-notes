import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
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
import { AppHeader, Button, HeaderBack, useTheme } from "@/shared/ui";
import {
  FULL_BOUNDS,
  ScriptureMap,
  zoomBounds,
  type Anchor,
  type Marker,
} from "@/widgets/scripture-map";
import { useScriptureMap } from "../model/useScriptureMap";

const PRECISION_LABEL = {
  site: "유적 일대의 한 점",
  city: "도시 주변의 대략적인 위치",
  area: "일대의 대략적인 위치",
} as const;

const periodName = (v: PlaceView) => v.period?.name ?? "시대 미상";

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
  const { state, retry } = useScriptureMap(MAP_DATA);
  // 선택은 화면에 남겨 둔다. 노트를 열었다 돌아와도 필터·지역·장소가 유지된다(R6).
  const [period, setPeriod] = useState<PeriodFilter>(undefined);
  const [regionKey, setRegionKey] = useState<string | null>(null);
  const [placeId, setPlaceId] = useState<string | null>(null);

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
        {regions.length > 0 ? (
          <MapSection
            regions={regions}
            region={region}
            place={place}
            onSelectRegion={(key) => {
              setRegionKey(key);
              setPlaceId(null);
            }}
            onSelectPlace={setPlaceId}
          />
        ) : null}
        {regions.length === 0 ? (
          <Message title="이 시대에 연결된 기록이 없어요">
            <Button label="전체 시대 보기" onPress={() => changePeriod(undefined)} />
          </Message>
        ) : place && region ? (
          <PlaceDetail
            region={region}
            view={place}
            onBack={() => setPlaceId(null)}
            onOpenNote={(id) =>
              router.push({ pathname: "/note/[id]", params: { id, from: "scripture-map" } })
            }
          />
        ) : region ? (
          <RegionDetail
            region={region}
            onBack={() => setRegionKey(null)}
            onSelect={setPlaceId}
          />
        ) : (
          <View>
            {regions.map((r) => (
              <Row
                key={r.key}
                title={r.name}
                subtitle={regionSubtitle(r)}
                onPress={() => setRegionKey(r.key)}
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
      <ScrollView className="flex-1" contentContainerClassName="pb-20">
        {body}
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
      accessibilityLabel={`${label}으로 돌아가기`}
      className="px-5.5 min-h-touch justify-center"
    >
      <Text className="text-accent text-label font-semibold">‹ {label}</Text>
    </Pressable>
  );
}

function RegionDetail({
  region,
  onBack,
  onSelect,
}: {
  region: RegionView;
  onBack: () => void;
  onSelect: (placeId: string) => void;
}) {
  const periods = new Set(region.places.map((p) => p.place.periodId)).size;
  return (
    <View>
      <BackLink label="전체 지역" onPress={onBack} />
      <View className="px-5.5 pb-3 gap-1">
        <Text className="font-bold text-ink text-title">{region.name}</Text>
        <Text className="text-ink-3 text-label">
          {periods}시대의 장소 · {region.noteCount}편의 기록
        </Text>
      </View>
      {region.places.map((v) => (
        <Row
          key={v.place.id}
          title={v.place.name}
          subtitle={`${periodName(v)} · 노트 ${v.notes.length}편`}
          onPress={() => onSelect(v.place.id)}
        />
      ))}
    </View>
  );
}

function PlaceDetail({
  region,
  view,
  onBack,
  onOpenNote,
}: {
  region: RegionView;
  view: PlaceView;
  onBack: () => void;
  onOpenNote: (id: string) => void;
}) {
  const { place } = view;
  return (
    <View>
      <BackLink label={region.name} onPress={onBack} />
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
  regions,
  region,
  place,
  onSelectRegion,
  onSelectPlace,
}: {
  regions: RegionView[];
  region: RegionView | null;
  place: PlaceView | null;
  onSelectRegion: (key: string) => void;
  onSelectPlace: (id: string | null) => void;
}) {
  // 지도의 표식과 아래 목록은 같은 선택 상태를 쓴다. 표식은 목록의 다른 입구일 뿐이다.
  const shown = useMemo(() => (region ? [region] : regions), [region, regions]);
  const anchors = useMemo<Anchor[]>(
    () =>
      shown.flatMap((r) =>
        r.places.map((v) => ({
          id: v.place.id,
          // 전체 지도: 지역 단위로 묶는다. 확대: 장소끼리 겹침만 본다.
          groupKey: region ? "zoom" : r.key,
          lat: v.place.lat,
          lon: v.place.lon,
        })),
      ),
    [shown, region],
  );
  const bounds = useMemo(
    () => (region ? zoomBounds(anchors, FULL_BOUNDS) : FULL_BOUNDS),
    [anchors, region],
  );
  const placeOf = useMemo(
    () => new Map(shown.flatMap((r) => r.places.map((v) => [v.place.id, { r, v }] as const))),
    [shown],
  );

  const label = (m: Marker) => {
    const first = placeOf.get(m.ids[0]!)!;
    if (region) {
      return m.ids.length > 1 ? `${m.ids.length}시대` : periodName(first.v);
    }
    const periods = new Set(
      first.r.places.filter((v) => m.ids.includes(v.place.id)).map((v) => v.place.periodId),
    ).size;
    return `${first.r.name} ${first.r.noteCount}편${periods > 1 ? ` · ${periods}시대` : ""}`;
  };

  const onSelect = (m: Marker) => {
    const first = placeOf.get(m.ids[0]!)!;
    if (!region) onSelectRegion(first.r.key);
    // 같은 자리의 여러 시대는 표식이 하나이므로 아래 시대별 목록에서 고른다.
    else onSelectPlace(m.ids.length === 1 ? m.ids[0]! : null);
  };

  return (
    <View className="pb-4">
      <ScriptureMap
        anchors={anchors}
        bounds={bounds}
        label={label}
        selectedIds={place ? [place.place.id] : []}
        onSelect={onSelect}
        accessibilityLabel="말씀 지도. 같은 기록을 아래 목록에서도 고를 수 있어요."
      />
      <Text className="px-5.5 pt-2 text-ink-3 text-caption">
        지도의 위치는 본문 배경을 이해하기 위한 참고 정보예요.
      </Text>
    </View>
  );
}
