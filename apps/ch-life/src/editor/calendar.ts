function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function formatYmd(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function parseYmd(s: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  const year = Number(m[1]);
  const month0 = Number(m[2]) - 1;
  const day = Number(m[3]);
  const d = new Date(year, month0, day);
  if (
    d.getFullYear() !== year ||
    d.getMonth() !== month0 ||
    d.getDate() !== day
  ) {
    return null;
  }
  return d;
}

export function formatKoreanDate(ymd: string): string {
  const d = parseYmd(ymd);
  if (!d) return ymd;
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

// 일요일 시작 6주(42칸) 격자. 각 칸은 YYYY-MM-DD 또는 패딩 null.
export function buildMonthGrid(year: number, month0: number): (string | null)[] {
  const first = new Date(year, month0, 1);
  const offset = first.getDay();
  const daysInMonth = new Date(year, month0 + 1, 0).getDate();
  const cells: (string | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(formatYmd(new Date(year, month0, day)));
  }
  while (cells.length < 42) cells.push(null);
  return cells;
}

export function addMonths(
  year: number,
  month0: number,
  delta: number,
): { year: number; month0: number } {
  const total = year * 12 + month0 + delta;
  return { year: Math.floor(total / 12), month0: ((total % 12) + 12) % 12 };
}

export function todayYmd(): string {
  return formatYmd(new Date());
}
