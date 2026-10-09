import { lookupVerses } from "@/entities/scripture";
import {
  validateScriptureWithLookup,
  type ScriptureValidation,
} from "./scripture-field-core";

export type { ScriptureValidation } from "./scripture-field-core";

// 생명양식 입력값을 검증한다. 성경 본문이 실제로 조회되면 valid.
export function validateScripture(ref: string): ScriptureValidation {
  return validateScriptureWithLookup(ref, lookupVerses);
}
