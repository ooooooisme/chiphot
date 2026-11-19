/** 展示层简评：2–3 句，来自 summary / reason，不写回库。 */

function splitSentences(text: string): string[] {
  const out: string[] = [];
  let buf = "";
  for (const ch of text) {
    buf += ch;
    if (/[。！？!?]/.test(ch)) {
      const s = buf.trim();
      if (s) out.push(s);
      buf = "";
    }
  }
  const tail = buf.trim();
  if (tail) out.push(tail);
  return out;
}

function norm(s: string): string {
  return s.replace(/\s+/g, "");
}

function reasonDuplicatesSummary(reason: string, summary: string | null | undefined): boolean {
  if (!summary?.trim()) return false;
  const r = norm(reason);
  const s = norm(summary);
  return r.length > 0 && (s.includes(r) || r.includes(s));
}

export interface ItemBrief {
  text: string;
  insufficient: boolean;
}

export function composeItemBrief(summary: string | null | undefined, reason: string | null | undefined): ItemBrief {
  const sentences: string[] = [];
  if (summary?.trim()) sentences.push(...splitSentences(summary.trim()));
  if (reason?.trim() && !reasonDuplicatesSummary(reason.trim(), summary)) {
    sentences.push(...splitSentences(reason.trim()));
  }
  const capped = sentences.slice(0, 3);
  const text = capped.join("");
  return { text, insufficient: capped.length < 2 };
}

export function listItemHash(id: string): string {
  return `#item-${id}`;
}

/** Cross-page jump to the canonical list anchor. */
export function homeItemLink(id: string): string {
  return `/#item-${id}`;
}

/** Hot ranking entry: list anchor when possible, otherwise the brief on /hot. */
export function hotStoryLink(storyPublicId: string, representativeItemId: string | null | undefined, listOnly: boolean): string {
  if (!listOnly) return `/story/${storyPublicId}`;
  if (representativeItemId) return homeItemLink(representativeItemId);
  return `/hot#story-${storyPublicId}`;
}

export function hotStoryAnchor(storyPublicId: string): string {
  return `story-${storyPublicId}`;
}