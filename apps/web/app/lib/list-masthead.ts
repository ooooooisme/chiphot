import type { FeedItemSummary } from "@aihot/contracts/site";
import { beijingDate } from "@aihot/contracts/time";
import { monthDay } from "./format";

const dayLabel = (ymd: string) => monthDay(ymd).replace(/(\d+)月(\d+)日/, "$1 月 $2 日");

/** Masthead label from the items on this list page (Source day-rail). */
export function listMastheadLabel(items: FeedItemSummary[], now = Date.now()): string | null {
  if (items.length === 0) return null;
  const days = [...new Set(items.map((i) => beijingDate(i.timelineAt)))].sort();
  const today = beijingDate(now);
  if (days.length === 1) {
    const d = days[0]!;
    const label = dayLabel(d);
    return d === today ? `今日日报 · ${label}` : `日报 · ${label}`;
  }
  return `日报 · ${dayLabel(days[0]!)}–${dayLabel(days.at(-1)!)}`;
}