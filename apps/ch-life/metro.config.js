const { getDefaultConfig } = require("expo/metro-config");
const { withUniwindConfig } = require("uniwind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withUniwindConfig(config, {
  // Tailwind는 이 파일이 있는 폴더 아래를 스캔한다 — src/ 루트에 두는 이유.
  cssEntryFile: "./src/global.css",
  // 테마 이름 = Variation(ADR-0010). light/dark는 내장이라 dark만 겹치고, light는 쓰지 않는다.
  extraThemes: ["minimal", "paper", "focus"],
  dtsFile: "./uniwind-types.d.ts",
});
