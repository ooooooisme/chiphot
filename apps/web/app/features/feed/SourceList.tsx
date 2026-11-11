import type { FeedItemSummary, TimelineCard } from "@aihot/contracts/site";
import { IntentLink } from "../../components/ui/IntentLink";
import { byBeijingDay, monthDay, monthDayTime, weekdayShort } from "../../lib/format";
import { markRead, useReadSet } from "../../lib/local-state";
import { rememberPreview } from "../item/preview";
import { beijingDate } from "@aihot/contracts/time";

function sourceName(item: FeedItemSummary): string {
  return item.channel === "x" && item.x ? item.x.authorName : item.source.name;
}

function EarlierRow({ item, at, day }: { item: FeedItemSummary; at: string; day?: string }) {
  const read = useReadSet().has(item.id);
  const dateLabel = day ? monthDay(day) : monthDay(beijingDate(at));
  const open = () => {
    rememberPreview(item);
    markRead(item.id);
  };
  return (
    <li className="src-earlier-row">
      <time dateTime={at} className="text-[13px] font-semibold text-ink-3 max-lg:text-[12.5px]">
        {dateLabel}
        <span className="block font-normal lg:hidden">{weekdayShort(beijingDate(at))} · {monthDayTime(at).split(" ").slice(-1)}</span>
      </time>
      <h3 className="text-[16px] font-bold leading-[1.4]">
        <IntentLink viewTransition to={`/items/${item.id}`} onClick={open} className={`hover:text-accent ${read ? "text-ink-3" : "text-ink"}`}>
          {item.title}
        </IntentLink>
      </h3>
      <p className="text-[12.5px] text-ink-3 max-lg:text-left lg:text-right">{sourceName(item)}</p>
    </li>
  );
}

export function SourceEarlierFromCards({ cards, today }: { cards: TimelineCard[]; today: string }) {
  if (cards.length === 0) return null;
  const days = byBeijingDay(cards, (c) => c.anchorAt);
  return (
    <section className="src-earlier" aria-labelledby="src-earlier-heading">
      <div className="src-container">
        <h2 id="src-earlier-heading" className="src-col-heading mb-5">
          更早
        </h2>
      </div>
      <ol className="src-container list-none">
        {days.map(({ day, entries }) => (
          <li key={day}>
            <div className="src-day-band">{day === today ? "今天" : monthDay(day)} · {weekdayShort(day)}</div>
            <ul className="list-none">
              {entries.map((c) => (
                <EarlierRow key={c.key} item={c.item} at={c.anchorAt} day={day} />
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function SourceEarlierFromItems({ items, today }: { items: FeedItemSummary[]; today: string }) {
  if (items.length === 0) return null;
  let lastDay = "";
  return (
    <section className="src-container src-earlier" aria-labelledby="src-earlier-heading">
      <h2 id="src-earlier-heading" className="src-col-heading mb-5">
        更早
      </h2>
      <ol className="list-none">
        {items.map((it) => {
          const day = beijingDate(it.timelineAt);
          const showBand = day !== lastDay;
          lastDay = day;
          return (
            <li key={it.id}>
              {showBand && (
                <div className="src-day-band">
                  {day === today ? "今天" : monthDay(day)} · {weekdayShort(day)}
                </div>
              )}
              <EarlierRow item={it} at={it.timelineAt} day={day} />
            </li>
          );
        })}
      </ol>
    </section>
  );
}
