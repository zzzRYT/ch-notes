import { MAP_DATA } from "../../api/map-data";
import { matchNotes } from "../match-notes";
import { validateMapData } from "../validate-data";

const place = (id: string) => {
  const p = MAP_DATA.places.find((x) => x.id === id);
  if (!p) throw new Error(`장소 없음: ${id}`);
  return p;
};

describe("출시 연결표", () => {
  it("무결성 검증을 통과한다", () => {
    expect(validateMapData(MAP_DATA)).toEqual([]);
  });

  it("모든 장소에 출처가 있다", () => {
    for (const p of MAP_DATA.places) expect(p.source.length).toBeGreaterThan(20);
  });

  it("같은 지역의 시대별 장소와 같은 좌표의 시대별 성전을 구분한다", () => {
    const a = place("jericho-joshua");
    const b = place("jericho-ministry");
    expect(a.regionKey).toBe(b.regionKey);
    expect([a.lat, a.lon]).not.toEqual([b.lat, b.lon]);

    const t1 = place("jerusalem-temple-kingdom");
    const t2 = place("jerusalem-temple-ministry");
    expect([t1.lat, t1.lon]).toEqual([t2.lat, t2.lon]);
    expect(t1.periodId).not.toBe(t2.periodId);
  });

  it("실제 본문 인용이 의도한 시대별 장소에 연결된다", () => {
    const links = matchNotes(
      [
        { id: "n1", scripture: "수 6:1-5", citedRefs: ["눅 19:5"] },
        { id: "n2", scripture: "막 2:3", citedRefs: ["히 11:30", "눅 19:46", "대하 3:1"] },
      ],
      MAP_DATA,
    );
    const pairs = links.map((l) => `${l.noteId}:${l.placeId}`).sort();
    expect(pairs).toEqual([
      "n1:jericho-joshua",
      "n1:jericho-ministry",
      "n2:capernaum-ministry",
      "n2:jerusalem-temple-kingdom",
      "n2:jerusalem-temple-ministry",
    ]);
  });
});
