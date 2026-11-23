import type { FeedItemSummary, TimelineCard } from "@aihot/contracts/site";
import { BriefParagraph, ItemMetaRow, ListTitle } from "./SourceBrief";
import { SourceImage } from "./SourceImage";

function EarlierRow({ item, at }: { item: FeedItemSummary; at: string }) {
  return (
    <li className="src-earlier-row" id={`item-${item.id}`}>
      <h3 className="text-[16px] font-bold leading-[1.4] text-ink">
        <ListTitle item={item} className="text-ink" />
      </h3>
      {item.sourceImage && <SourceImage image={item.sourceImage} variant="compact" />}
      <BriefParagraph summary={item.summary} reason={item.reason} className="src-list-brief-secondary mt-2" />
      <div className="src-earlier-meta">
        <ItemMetaRow item={item} at={at} />
      </div>
    </li>
  );
}

export function SourceEarlierFromCards({ cards, today }: { cards: TimelineCard[]; today?: string }) {
  return SourceEarlierFromItems({ items: cards.map((c) => c.item), today });
}

export function SourceEarlierFromItems({ items, today: _today }: { items: FeedItemSummary[]; today?: string }) {
  if (items.length === 0) return null;
  return (
    <section className="src-earlier" aria-labelledby="src-earlier-heading">
      <div className="src-container">
        <h2 id="src-earlier-heading" className="src-col-heading mb-5">
          更早
        </h2>
      </div>
      <ol className="src-container list-none">
        {items.map((it) => (
          <EarlierRow key={it.id} item={it} at={it.timelineAt} />
        ))}
      </ol>
    </section>
  );
}