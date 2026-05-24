import type { BlockNode } from "@/domain/types";

export function extractCitedRefs(body: BlockNode[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const b of body) {
    if (b.type === "quote" && !seen.has(b.ref)) {
      seen.add(b.ref);
      out.push(b.ref);
    }
  }
  return out;
}
