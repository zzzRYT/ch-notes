const fs = require("node:fs");
const path = require("node:path");
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

// ── FSD 경계(ADR-0024) ─────────────────────────────────────────────
// 의존은 app → pages → widgets → features → entities → shared 한 방향이다.
// 같은 층의 Slice끼리는 서로 모르고, 밖에서는 Slice의 index.ts만 본다.
const SRC = path.join(__dirname, "src");
const LAYERS = ["shared", "entities", "features", "widgets", "pages", "app"];

function dirs(p) {
  return fs.existsSync(p)
    ? fs
        .readdirSync(p, { withFileTypes: true })
        .filter((d) => d.isDirectory() && !d.name.startsWith("__"))
        .map((d) => d.name)
    : [];
}

// features는 group/slice 두 단계, 나머지 층은 slice 한 단계.
function slicesOf(layer) {
  const root = path.join(SRC, layer);
  if (layer === "features") {
    return dirs(root).flatMap((group) =>
      dirs(path.join(root, group)).map((slice) => `${group}/${slice}`),
    );
  }
  return dirs(root);
}

// 아래층은 위층을 import하지 못한다.
const upwardZones = LAYERS.slice(0, -1).map((layer, i) => ({
  target: `./src/${layer}`,
  from: LAYERS.slice(i + 1).map((upper) => `./src/${upper}`),
  message: `${layer}는 상위 레이어를 import할 수 없다 (ADR-0024).`,
}));

// 같은 층의 다른 Slice를 import하지 못한다(자기 Slice 안은 허용).
const siblingZones = ["entities", "features", "widgets", "pages"].flatMap(
  (layer) =>
    slicesOf(layer).map((slice) => ({
      target: `./src/${layer}/${slice}`,
      from: `./src/${layer}`,
      except: [`./${slice}`],
      message: `같은 레이어의 다른 Slice를 직접 import할 수 없다 (ADR-0024).`,
    })),
);

const fsdBoundaries = {
  files: ["src/**/*.{ts,tsx}"],
  ignores: ["src/**/__tests__/**"],
  settings: {
    "import/resolver": {
      typescript: { project: path.join(__dirname, "tsconfig.json") },
      node: { extensions: [".js", ".jsx", ".ts", ".tsx"] },
    },
  },
  rules: {
    "import/no-restricted-paths": [
      "error",
      { basePath: __dirname, zones: [...upwardZones, ...siblingZones] },
    ],
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            regex: "^@/(pages|widgets|entities)/[^/]+/.+",
            message: "Slice 내부 경로가 아니라 공개 인터페이스(index.ts)를 import한다.",
          },
          {
            regex: "^@/features/[^/]+/[^/]+/.+",
            message: "Slice 내부 경로가 아니라 공개 인터페이스(index.ts)를 import한다.",
          },
          {
            regex: "^@/shared/[^/]+/.+",
            message: "shared는 세그먼트 index(@/shared/ui, @/shared/lib, …)로만 import한다.",
          },
          {
            // 두 단계 이상 올라가는 상대 경로는 자기 Slice 밖이다. 번들 에셋만 예외.
            regex: "^(\\.\\./){2,}(?!(\\.\\./)*assets/)",
            message: "다른 Slice는 `@/` 별칭으로 공개 인터페이스를 import한다.",
          },
        ],
      },
    ],
    "no-restricted-syntax": [
      "error",
      {
        selector: "ExportAllDeclaration",
        message: "`export *`는 금지다. 필요한 이름만 내보낸다 (ADR-0024).",
      },
    ],
  },
};

module.exports = defineConfig([
  expoConfig,
  {
    files: ["eslint.config.js"],
    languageOptions: { globals: { __dirname: "readonly", require: "readonly", module: "writable" } },
  },
  {
    ignores: [
      "dist/*",
      ".expo/*",
      "android/*",
      "ios/*",
      "scripts/*",
      "editor-web/*",
      "src/editor/generated/*",
    ],
  },
  fsdBoundaries,
]);
