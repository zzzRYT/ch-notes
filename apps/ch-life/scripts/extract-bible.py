ㅌ#!/usr/bin/env python3
"""
OpenBible.ko-KR PDF 에서 성경 전문을 추출해 assets/bible.json 으로 저장.

PDF가 유일한 원 소스. 다른 외부 소스에 의존하지 않는다.

폰트 기반 분류 (pymupdf 'dict' span size 기반):
  - 24pt ArialNarrow-Bold     : 장 번호 (chapter marker)
  - 12pt MalgunGothicBold     : 페이지 헤더 (책 제목)
  - 7pt  Malgun/Leggibilmente : 본문 (한글 + 라틴 구두점)
  - 4pt  Leggibilmente        : 절 번호 (verse marker, superscript)

페이지 레이아웃:
  - 396.84 x 612.36 pts, 2단 컬럼
  - 좌측 컬럼: x ∈ [0, 200)
  - 우측 컬럼: x ∈ [200, 400]
  - 페이지 헤더: y < 30

PDF의 한글 책 이름 → USFM 3글자 코드는 BOOK_MAP 으로 매핑.
PDF는 'Luke'를 '루가복음'으로 표기하나, JSON 키는 표준 'Luk' 사용.

실행:
  /tmp/pdfvenv/bin/python scripts/extract-bible.py
환경변수:
  OPENBIBLE_PDF      입력 PDF 경로 (기본: ~/Downloads/OpenBible.ko-KR.pdf)
  OPENBIBLE_OUT      출력 JSON 경로 (기본: ../assets/bible.json)
"""
from __future__ import annotations
import json
import os
import re
import sys
from pathlib import Path
from typing import Iterable

import fitz  # pymupdf


# PDF 한글 책 이름(헤더 표기 기준) → USFM 3글자 코드
BOOK_MAP: dict[str, str] = {
    "창세기": "Gen", "출애굽기": "Exo", "레위기": "Lev", "민수기": "Num",
    "신명기": "Deu", "여호수아": "Jos", "사사기": "Jdg", "룻기": "Rut",
    "사무엘상": "1Sa", "사무엘하": "2Sa", "열왕기상": "1Ki", "열왕기하": "2Ki",
    "역대상": "1Ch", "역대하": "2Ch", "에스라": "Ezr", "느헤미야": "Neh",
    "에스더": "Est", "욥기": "Job", "시편": "Psa", "잠언": "Pro",
    "전도서": "Ecc", "아가": "Sng", "이사야": "Isa", "예레미야": "Jer",
    "예레미야애가": "Lam", "에스겔": "Ezk", "다니엘": "Dan", "호세아": "Hos",
    "요엘": "Joe", "아모스": "Amo", "오바댜": "Oba", "요나": "Jon",
    "미가": "Mic", "나훔": "Nam", "하박국": "Hab", "스바냐": "Zep",
    "학개": "Hag", "스가랴": "Zec", "말라기": "Mal",
    "마태복음": "Mat", "마가복음": "Mrk", "루가복음": "Luk", "요한복음": "Jhn",
    "사도행전": "Act", "로마서": "Rom", "고린도전서": "1Co", "고린도후서": "2Co",
    "갈라디아서": "Gal", "에베소서": "Eph", "빌립보서": "Php", "골로새서": "Col",
    "데살로니가전서": "1Th", "데살로니가후서": "2Th",
    "디모데전서": "1Ti", "디모데후서": "2Ti", "디도서": "Tit", "빌레몬서": "Phm",
    "히브리서": "Heb", "야고보서": "Jas", "베드로전서": "1Pe", "베드로후서": "2Pe",
    "요한일서": "1Jn", "요한이서": "2Jn", "요한삼서": "3Jn", "유다서": "Jud",
    "요한계시록": "Rev",
}
# 처음 등장 순서로 정렬된 정경 코드 목록
CANON_ORDER = [
    "Gen", "Exo", "Lev", "Num", "Deu", "Jos", "Jdg", "Rut",
    "1Sa", "2Sa", "1Ki", "2Ki", "1Ch", "2Ch", "Ezr", "Neh",
    "Est", "Job", "Psa", "Pro", "Ecc", "Sng", "Isa", "Jer",
    "Lam", "Ezk", "Dan", "Hos", "Joe", "Amo", "Oba", "Jon",
    "Mic", "Nam", "Hab", "Zep", "Hag", "Zec", "Mal",
    "Mat", "Mrk", "Luk", "Jhn", "Act", "Rom", "1Co", "2Co",
    "Gal", "Eph", "Php", "Col", "1Th", "2Th", "1Ti", "2Ti",
    "Tit", "Phm", "Heb", "Jas", "1Pe", "2Pe", "1Jn", "2Jn",
    "3Jn", "Jud", "Rev",
]

COLUMN_SPLIT_X = 200.0      # 페이지 너비 396.84 의 약 절반
HEADER_Y_MAX   = 30.0       # 페이지 헤더는 상단 30pt 이내
SIZE_CHAPTER   = 24.0
SIZE_HEADER    = 12.0
SIZE_BODY      = 7.0
SIZE_VERSE     = 4.0


def collect_spans(page: fitz.Page) -> list[dict]:
    out: list[dict] = []
    for block in page.get_text("dict")["blocks"]:
        for line in block.get("lines", []):
            for sp in line.get("spans", []):
                txt = sp["text"]
                if not txt or txt.isspace():
                    continue
                out.append({
                    "text": txt,
                    "size": round(sp["size"], 1),
                    "font": sp.get("font", ""),
                    "x": sp["bbox"][0],
                    "y": sp["bbox"][1],
                })
    return out


def page_header(spans: list[dict]) -> str | None:
    for s in spans:
        if s["y"] < HEADER_Y_MAX and abs(s["size"] - SIZE_HEADER) < 0.5:
            return s["text"].strip()
    return None


def column_sort(spans: Iterable[dict]) -> list[dict]:
    # 같은 line(y 차이 ≤ ~5pt) 안에서는 x 오름차순으로 처리해야
    # 본문, 구두점, 4pt 절 번호 등이 자연스러운 순서로 나열된다.
    # 라인 간격은 약 11pt 이므로 5pt buckets 면 라인 충돌 없음.
    return sorted(spans, key=lambda s: (int(s["y"] // 5), s["x"]))


def append_body(buf: list[str], span: dict) -> None:
    """span 텍스트를 누적 버퍼에 추가하되 한글 단어 사이 공백을 자연스럽게 처리."""
    text = span["text"]
    if not buf:
        buf.append(text)
        return
    prev = buf[-1]
    # 직전과 현재 모두 한글 폰트이면 공백 추가 (없을 때만)
    is_hangul = lambda f: f.startswith("Malgun")
    if (
        is_hangul(span["font"])
        and not prev.endswith(" ")
        and not prev.endswith("\n")
        and not text.startswith(" ")
    ):
        # 직전 글자가 한글이고 현재 시작이 한글일 때
        if prev and re.match(r"[가-힣]", prev[-1]) and re.match(r"[가-힣]", text[0]):
            buf.append(" ")
    buf.append(text)


def normalize_text(s: str) -> str:
    # 다중 공백 → 단일 공백, 양끝 strip
    s = re.sub(r"[ \t]+", " ", s)
    s = re.sub(r"\s+([,.!?;:])", r"\1", s)
    return s.strip()


def is_chapter_marker(span: dict) -> bool:
    return abs(span["size"] - SIZE_CHAPTER) < 0.5 and span["text"].strip().isdigit()


def is_verse_marker(span: dict) -> bool:
    return abs(span["size"] - SIZE_VERSE) < 0.5 and span["text"].strip().isdigit()


def is_body(span: dict) -> bool:
    return abs(span["size"] - SIZE_BODY) < 0.5


def extract(pdf_path: str) -> dict:
    doc = fitz.open(pdf_path)
    data: dict[str, dict[str, dict[str, str]]] = {code: {} for code in CANON_ORDER}

    cur_code: str | None = None
    cur_chapter: int | None = None
    cur_verse: int | None = None
    cur_buf: list[str] = []

    unknown_headers: set[str] = set()

    def flush() -> None:
        nonlocal cur_buf
        if cur_code is None or cur_chapter is None or cur_verse is None:
            cur_buf = []
            return
        text = normalize_text("".join(cur_buf))
        if not text:
            cur_buf = []
            return
        ch_key = str(cur_chapter)
        v_key = str(cur_verse)
        ch_map = data[cur_code].setdefault(ch_key, {})
        # 같은 절이 분할된 경우 이어붙임
        if v_key in ch_map:
            ch_map[v_key] = normalize_text(ch_map[v_key] + " " + text)
        else:
            ch_map[v_key] = text
        cur_buf = []

    for page_idx in range(len(doc)):
        page = doc[page_idx]
        spans = collect_spans(page)

        header = page_header(spans)
        if header is None:
            # 헤더 없는 페이지는 책 결정 불가 → skip
            continue
        if header not in BOOK_MAP:
            unknown_headers.add(header)
            continue
        page_code = BOOK_MAP[header]

        # 책 전환 감지: 페이지 헤더가 바뀌면 직전 절 flush, 상태 리셋
        if cur_code != page_code:
            flush()
            cur_code = page_code
            cur_chapter = None
            cur_verse = None
            cur_buf = []

        body_spans = [s for s in spans if s["y"] >= HEADER_Y_MAX]
        left  = column_sort([s for s in body_spans if s["x"] < COLUMN_SPLIT_X])
        right = column_sort([s for s in body_spans if s["x"] >= COLUMN_SPLIT_X])

        for column in (left, right):
            for sp in column:
                if is_chapter_marker(sp):
                    flush()
                    cur_chapter = int(sp["text"].strip())
                    cur_verse = 1
                    cur_buf = []
                elif is_verse_marker(sp):
                    if cur_chapter is None:
                        # 장 없이 절 번호가 먼저 나오면 무시 (방어적)
                        continue
                    flush()
                    cur_verse = int(sp["text"].strip())
                elif is_body(sp):
                    if cur_chapter is None:
                        continue
                    append_body(cur_buf, sp)
                else:
                    # 알 수 없는 size — 보수적으로 본문으로 취급
                    if cur_chapter is not None:
                        append_body(cur_buf, sp)

    flush()

    if unknown_headers:
        sys.stderr.write(
            f"[warn] 알 수 없는 페이지 헤더 (skip): {sorted(unknown_headers)}\n"
        )
    return data


def stats(data: dict) -> tuple[int, int, int]:
    books = sum(1 for b in data.values() if b)
    chapters = sum(len(b) for b in data.values())
    verses = sum(len(c) for b in data.values() for c in b.values())
    return books, chapters, verses


def main() -> int:
    pdf_path = os.environ.get(
        "OPENBIBLE_PDF",
        os.path.expanduser("~/Downloads/OpenBible.ko-KR.pdf"),
    )
    out_path = Path(
        os.environ.get(
            "OPENBIBLE_OUT",
            str(Path(__file__).parent.parent / "assets" / "bible.json"),
        )
    ).resolve()

    if not Path(pdf_path).is_file():
        sys.stderr.write(f"PDF not found: {pdf_path}\n")
        return 1

    sys.stderr.write(f"input : {pdf_path}\n")
    sys.stderr.write(f"output: {out_path}\n")

    data = extract(pdf_path)
    books, chapters, verses = stats(data)
    sys.stderr.write(f"books={books} chapters={chapters} verses={verses}\n")

    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False)
        f.write("\n")
    sys.stderr.write(f"wrote {out_path}\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
