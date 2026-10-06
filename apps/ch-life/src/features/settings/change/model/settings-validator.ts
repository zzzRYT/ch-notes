import {
  ACCENT_OPTIONS,
  BLOCK_STYLE_OPTIONS,
  FONT_FAMILY_OPTIONS,
  VARIATION_OPTIONS,
  type Variation,
} from "@/shared/config";
import {
  FONT_SCALE_OPTIONS,
  THEME_PREFERENCES,
  type Settings,
} from "./settings-store";

const ALLOWED_FONT = FONT_SCALE_OPTIONS.map((o) => o.value);
const ALLOWED_VARIATION = VARIATION_OPTIONS.map((o) => o.value);
const ALLOWED_BLOCK_STYLE = BLOCK_STYLE_OPTIONS.map((o) => o.value);
const ALLOWED_FONT_FAMILY = FONT_FAMILY_OPTIONS.map((o) => o.value);
const ALLOWED_ACCENT = ACCENT_OPTIONS.map((o) => o.value);

function readVariation(value: unknown, themePref: unknown): Variation {
  if (
    typeof value === "string" &&
    (ALLOWED_VARIATION as ReadonlyArray<string>).includes(value)
  ) {
    return value as Variation;
  }
  if (themePref === "dark") return "dark";
  return "focus";
}

function readEnum<T extends string>(
  value: unknown,
  allowed: ReadonlyArray<T>,
  fallback: T,
): T {
  if (
    typeof value === "string" &&
    (allowed as ReadonlyArray<string>).includes(value)
  ) {
    return value as T;
  }
  return fallback;
}

function readNullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

export function parseSettings(x: unknown): Settings | null {
  if (typeof x !== "object" || x === null) return null;
  const s = x as Record<string, unknown>;
  if (
    typeof s.fontScale !== "number" ||
    !(ALLOWED_FONT as ReadonlyArray<number>).includes(s.fontScale)
  )
    return null;
  if (
    typeof s.themePreference !== "string" ||
    !(THEME_PREFERENCES as ReadonlyArray<string>).includes(s.themePreference)
  )
    return null;
  return {
    fontScale: s.fontScale as Settings["fontScale"],
    themePreference: s.themePreference as Settings["themePreference"],
    variation: readVariation(s.variation, s.themePreference),
    blockStyle: readEnum(s.blockStyle, ALLOWED_BLOCK_STYLE, "default"),
    fontFamily: readEnum(s.fontFamily, ALLOWED_FONT_FAMILY, "sans"),
    accentChoice: readEnum(s.accentChoice, ALLOWED_ACCENT, "default"),
    lastOpenedNoteId: readNullableString(s.lastOpenedNoteId),
    lastBibleRef: readNullableString(s.lastBibleRef),
    dismissedUpdateVersion: readNullableString(s.dismissedUpdateVersion),
  };
}
