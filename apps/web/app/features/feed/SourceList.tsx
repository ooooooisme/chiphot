import type { FeedItemSummary, TimelineCard } from "@aihot/contracts/site";
import { IntentLink } from "../../components/ui/IntentLink";
import { sourceListTime } from "../../lib/format";
import { markRead, useReadSet } from "../../lib/local-state";
import { rememberPreview } from "../item/preview";

function sourceName(item: FeedItemSummary): string {
  return item.channel === "x" && item.x ? item.x.authorName : item.source.name;
}

function EarlierRow({ item, at }: { item: FeedItemSummary; at: string }) {
  const read = useReadSet().has(item.id);
  const open = () => {
    rememberPreview(item);
    markRead(item.id);
  };
  return (
    <li className="src-earlier-row">
      <time dateTime={at} className="text-[13px] font-semibold text-ink-3 max-lg:text-[12.5px]">
        {sourceListTime(at)}
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

export function SourceEarlierFromCards({ cards }: { cards: TimelineCard[]; today?: string }) {
  if (cards.length === 0) return null;
  return (
    <section className="src-earlier" aria-labelledby="src-earlier-heading">
      <div className="src-container">
        <h2 id="src-earlier-heading" className="src-col-heading mb-5">
          更早
        </h2>
      </div>
      <ol className="src-container list-none">
        {cards.map((c) => (
          <EarlierRow key={c.key} item={c.item} at={c.anchorAt} />
        ))}
      </ol>
    </section>
  );
}

export function SourceEarlierFromItems({ items }: { items: FeedItemSummary[]; today?: string }) {
  if (items.length === 0) return null;
  return (
    <section className="src-container src-earlier" aria-labelledby="src-earlier-heading">
      <h2 id="src-earlier-heading" className="src-col-heading mb-5">
        更早
      </h2>
      <ol className="list-none">
        {items.map((it) => (
          <EarlierRow key={it.id} item={it} at={it.timelineAt} />
        ))}
      </ol>
    </section>
  );
}
