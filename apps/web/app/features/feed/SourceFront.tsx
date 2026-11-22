import type { FeedItemSummary, GroupInfo, TimelineFilters } from "@aihot/contracts/site";
import { CATEGORY_LABELS, type CategoryKey } from "@aihot/contracts/taxonomy";
import { useReadSet } from "../../lib/local-state";
import { SourceGroupLead } from "./SourceGroup";
import { sourceListTime } from "../../lib/format";
import { BriefInsufficient, BriefParagraph, ListTitle, OriginalSourceLink } from "./SourceBrief";

export const SOURCE_FRONT_USED = 7;

function catLabel(category: string | null | undefined): string {
  if (category && category in CATEGORY_LABELS) return CATEGORY_LABELS[category as CategoryKey];
  return CATEGORY_LABELS.industry;
}

function Kicker({ item }: { item: FeedItemSummary }) {
  return (
    <p className="src-kicker">
      {item.selected && !item.sameEvent && <span className="text-[var(--src-gold,#9A6700)]">精选</span>}
      {item.category && <span className="text-accent">{catLabel(item.category)}</span>}
    </p>
  );
}

function ItemMeta({ item, at }: { item: FeedItemSummary; at?: string }) {
  return (
    <p className="src-meta">
      <OriginalSourceLink item={item} className="font-semibold text-ink-2 hover:text-accent" />
      {at && (
        <>
          {" · "}
          <time dateTime={at}>{sourceListTime(at)}</time>
        </>
      )}
    </p>
  );
}

function LeadColumn({
  item,
  at,
  group,
  filters,
}: {
  item: FeedItemSummary;
  at: string;
  group: GroupInfo | null;
  filters?: TimelineFilters;
}) {
  const read = useReadSet().has(item.id);
  const showGroup = group && group.additionalSourceCount > 0;
  return (
    <section className="src-front-col src-front-col-lead max-lg:border-b max-lg:border-line max-lg:pb-5 max-lg:mb-5" aria-labelledby="src-lead-title">
      <Kicker item={item} />
      <h2 id="src-lead-title" className="text-[25px] font-extrabold leading-[1.2] tracking-[-0.015em] text-ink lg:text-[40px] lg:font-extrabold lg:leading-[1.2]">
        <ListTitle item={item} read={read} className="" />
      </h2>
      <BriefParagraph summary={item.summary} reason={item.reason} className="src-list-brief-lead max-lg:mt-3 max-lg:text-[15.5px]" />
      <BriefInsufficient summary={item.summary} reason={item.reason} />
      <ItemMeta item={item} at={at} />
      {showGroup && <SourceGroupLead group={group!} parentId={item.id} filters={filters} />}
    </section>
  );
}

function SecondaryItem({ item, at, divider }: { item: FeedItemSummary; at: string; divider: boolean }) {
  const read = useReadSet().has(item.id);
  return (
    <article className={divider ? "border-t border-line pt-[22px] max-lg:pt-5" : ""} id={`item-${item.id}`}>
      <Kicker item={item} />
      <h3 className="text-[17px] font-bold leading-[1.35] text-ink lg:text-[19px] lg:font-[750]">
        <ListTitle item={item} read={read} className="" />
      </h3>
      <BriefParagraph summary={item.summary} reason={item.reason} className="src-list-brief-secondary mt-2.5 lg:mt-2.5" />
      <BriefInsufficient summary={item.summary} reason={item.reason} />
      <div className="mt-2 lg:mt-2.5">
        <ItemMeta item={item} at={at} />
      </div>
    </article>
  );
}

function SecondaryColumn({ items, atById }: { items: FeedItemSummary[]; atById: Map<string, string> }) {
  return (
    <section className="src-front-col src-front-col-mid max-lg:space-y-5 max-lg:border-b max-lg:border-line max-lg:pb-5 max-lg:mb-5" aria-label="次要报道">
      {items.map((item, i) => (
        <SecondaryItem key={item.id} item={item} at={atById.get(item.id) ?? item.timelineAt} divider={i > 0} />
      ))}
    </section>
  );
}

function LatestItem({ item, at }: { item: FeedItemSummary; at: string }) {
  const read = useReadSet().has(item.id);
  return (
    <li className="border-b border-line py-3.5 first:pt-0 lg:py-[14px]" id={`item-${item.id}`}>
      <h3 className="text-[15px] font-[680] leading-[1.4] text-ink">
        <ListTitle item={item} read={read} className={read ? "text-ink-3" : "text-ink"} />
      </h3>
      <BriefParagraph summary={item.summary} reason={item.reason} className="src-list-brief-secondary mt-2" />
      <div className="src-earlier-meta mt-2">
        <BriefInsufficient summary={item.summary} reason={item.reason} />
        <time dateTime={at}>{sourceListTime(at)}</time>
        <span aria-hidden="true">·</span>
        <OriginalSourceLink item={item} />
      </div>
    </li>
  );
}

function LatestColumn({ items, atById }: { items: FeedItemSummary[]; atById: Map<string, string> }) {
  return (
    <section className="src-front-col src-front-col-latest" aria-labelledby="src-latest-heading">
      <h2 id="src-latest-heading" className="src-col-heading">
        最新
      </h2>
      <ul>
        {items.map((item) => (
          <LatestItem key={item.id} item={item} at={atById.get(item.id) ?? item.timelineAt} />
        ))}
      </ul>
    </section>
  );
}

export function SourceFront({
  items,
  filters,
  groupByParent,
}: {
  items: FeedItemSummary[];
  filters?: TimelineFilters;
  groupByParent?: Map<string, GroupInfo | null>;
}) {
  if (items.length === 0) return null;
  const atById = new Map(items.map((i) => [i.id, i.timelineAt]));
  const lead = items[0]!;
  const secondary = items.slice(1, 3);
  const latest = items.slice(3, 7);
  const leadGroup = groupByParent?.get(lead.id) ?? null;
  return (
    <section className="src-container" aria-label="头版">
      <div className="src-front">
        <div className="src-front-grid">
          <div id={`item-${lead.id}`}>
            <LeadColumn item={lead} at={lead.timelineAt} group={leadGroup} filters={filters} />
          </div>
          {secondary.length > 0 && <SecondaryColumn items={secondary} atById={atById} />}
          {latest.length > 0 && <LatestColumn items={latest} atById={atById} />}
        </div>
      </div>
    </section>
  );
}