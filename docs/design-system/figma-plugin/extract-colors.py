#!/usr/bin/env python3
"""ThemeProvider.tsx 의 4개 팔레트를 tokens.colors.{json,js} 로 뽑는다.

색값을 손으로 옮겨 적지 않기 위한 스크립트다. 저장소 루트에서 실행한다:

    python3 docs/design-system/figma-plugin/extract-colors.py

4개 팔레트 전부에서 값이 동일한 레거시 필드(surface/text/line/quoteBar)는
신 토큰(paper/ink/rule/ink4)으로 통일했으므로 내보내지 않는다(결정 #7).
동일하지 않으면 assert 로 멈춘다 — 조용히 어긋나는 것을 막는다.
"""
import re, json, io, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
SRC = os.path.join(ROOT, "apps/ch-life/src/theme/ThemeProvider.tsx")
OUT = os.path.dirname(os.path.abspath(__file__))

src = io.open(SRC, encoding="utf-8").read()
pals = {}
for name in ["MINIMAL", "PAPER", "FOCUS", "DARK"]:
    m = re.search(rf"const {name}: ThemeColors = \{{(.*?)\n\}};", src, re.S)
    if not m:
        sys.exit(f"팔레트를 찾지 못했다: {name} — ThemeProvider.tsx 구조가 바뀌었는지 확인할 것")
    pals[name] = {k: v for k, v in re.findall(r'(\w+):\s*"([^"]+)"', m.group(1))}

THEMES = [("minimal", "MINIMAL"), ("paper", "PAPER"), ("focus", "FOCUS"), ("dark", "DARK")]

def to_rgba(s):
    s = s.strip()
    m = re.fullmatch(r"#([0-9a-fA-F]{6})", s)
    if m:
        n = int(m.group(1), 16)
        return ((n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255, 1.0)
    m = re.fullmatch(r"rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)", s)
    if m:
        r, g, b = [float(m.group(i)) / 255 for i in (1, 2, 3)]
        return (r, g, b, float(m.group(4)) if m.group(4) else 1.0)
    sys.exit("해석하지 못한 색: " + s)

DUPES = {"surface": "paper", "text": "ink", "line": "rule", "quoteBar": "ink4"}
for legacy, new in DUPES.items():
    for _, K in THEMES:
        assert pals[K][legacy] == pals[K][new], (
            f"{K}.{legacy} 와 {K}.{new} 가 더 이상 같지 않다 — "
            "레거시 필드를 그냥 지울 수 없다. 조사 문서 1-1절을 다시 볼 것")

FIELDS = [
    ("bg", "bg", "캔버스 배경. paper와 다르다(focus만 동일)"),
    ("paper", "paper", "카드·시트 표면. 레거시 surface와 4팔레트 전부 동일 → 통일"),
    ("ink", "ink", "본문 텍스트. 레거시 text와 4팔레트 전부 동일 → 통일"),
    ("ink-2", "ink2", "보조 텍스트"),
    ("ink-3", "ink3", "흐린 텍스트·placeholder"),
    ("ink-4", "ink4", "가장 흐림. 레거시 quoteBar와 4팔레트 전부 동일 → 통일"),
    ("subtle", "subtle", "⚠️ ink2와 값이 다르다(4팔레트 전부). 통합하지 말 것"),
    ("rule", "rule", "구분선. 레거시 line과 4팔레트 전부 동일 → 통일"),
    ("accent", "accent", "강조색. 사용자가 accentChoice로 덮어쓸 수 있다"),
    ("accent-soft", "accentSoft", "강조색 옅은 배경. ⚠️ 변형 내장 알파는 8/9/8/14%인데 사용자가 색을 직접 고르면 항상 8%로 파생된다(규칙이 둘)"),
    ("accent-text", "accentText", "accent 위에 얹는 텍스트색"),
    ("chip-bg", "chipBg", "칩 배경"),
    ("chip-text", "chipText", "칩 텍스트. minimal·focus는 ink2와 같고 paper·dark는 다르다 — 규칙성 없음(확인필요)"),
    ("err-bar", "errBar", "오류 막대·테두리"),
    ("err-bg", "errBg", "오류 배경. ⚠️ paper만 알파(0.12), 나머지는 solid"),
    ("err-text", "errText", "오류 텍스트. ⚠️ dark만 errBar와 다르다"),
]

colors = []
for tname, K in THEMES:
    for figname, field, desc in FIELDS:
        r, g, b, a = to_rgba(pals[K][field])
        colors.append({"name": f"{tname}/{figname}", "r": round(r, 6), "g": round(g, 6),
                       "b": round(b, 6), "a": round(a, 4), "code": f"colors.{field}",
                       "desc": desc, "raw": pals[K][field]})

io.open(os.path.join(OUT, "tokens.colors.json"), "w", encoding="utf-8").write(
    json.dumps(colors, ensure_ascii=False, indent=1))
io.open(os.path.join(OUT, "tokens.colors.js"), "w", encoding="utf-8").write(
    "// 자동 생성 — apps/ch-life/src/theme/ThemeProvider.tsx 에서 추출. 직접 수정하지 말 것.\n"
    "// 재생성: python3 docs/design-system/figma-plugin/extract-colors.py\n"
    "const COLOR_TOKENS = " + json.dumps(colors, ensure_ascii=False, indent=1) + ";\n")

print(f"색 토큰 {len(colors)}개 ({len(THEMES)}테마 × {len(FIELDS)}필드)")
print("중복이라 제외한 레거시 필드:", ", ".join(DUPES))
print("→ tokens.colors.json / tokens.colors.js")
