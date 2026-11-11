import type { TimelineCard, TimelineFilters } from "@aihot/contracts/site";
import { CATEGORY_LABELS, type CategoryKey } from "@aihot/contracts/taxonomy";
import { IntentLink } from "../../components/ui/IntentLink";
import { markRead, useReadSet } from "../../lib/local-state";
import { rememberPreview } from "../item/preview";
import { SourceGroupLead } from "./SourceGroup";
import { monthDayTime } from "../../lib/format";

export const SOURCE_FRONT_USED = 7;

export function sourceFrontExcludeKeys(cards: TimelineCard[]): Set<string> {
  return new Set(cards.slice(0, SOURCE_FRONT_USED).map((c) => c.key));
}

function catLabel(category: string | null | undefined): string {
  if (category && category in CATEGORY_LABELS) return CATEGORY_LABELS[category as CategoryKey];
  return CATEGORY_LABELS.industry;
}

function Kicker({ item }: { item: TimelineCard["item"] }) {
  return (
    <p className="src-kicker">
      {item.selected && !item.sameEvent && <span className="text-[var(--src-gold,#9A6700)]">精选</span>}
      {item.category && <span className="text-accent">{catLabel(item.category)}</span>}
    </p>
  );
}

function ItemMeta({ item, at }: { item: TimelineCard["item"]; at?: string }) {
  const name = item.channel === "x" && item.x ? item.x.authorName : item.source.name;
  return (
    <p className="src-meta">
      <strong>{name}</strong>
      {at && (
        <>
          {" · "}
          <time dateTime={at}>{monthDayTime(at)}</time>
        </>
      )}
    </p>
  );
}

function openItem(item: TimelineCard["item"], onOpen?: (id: string) => void) {
  rememberPreview(item);
  onOpen?.(item.id);
}

function LeadColumn({ card, filters }: { card: TimelineCard; filters?: TimelineFilters }) {
  const { item, group } = card;
  const readSet = useReadSet();
  const read = readSet.has(item.id);
  const showGroup = group && group.additionalSourceCount > 0;
  return (
    <section className="src-front-col src-front-col-lead max-lg:border-b max-lg:border-line max-lg:pb-5 max-lg:mb-5" aria-labelledby="src-lead-title">
      <Kicker item={item} />
      <h2 id="src-lead-title" className="text-[25px] font-extrabold leading-[1.2] tracking-[-0.015em] text-ink lg:text-[40px] lg:font-extrabold lg:leading-[1.2]">
        <IntentLink viewTransition to={`/items/${item.id}`} onClick={() => openItem(item, markRead)} className={`hover:text-accent ${read ? "text-ink-3" : ""}`}>
          {item.title}
        </IntentLink>
      </h2>
      {item.summary && (
        <p className="mt-3 text-[15.5px] font-normal leading-[1.7] text-ink-2 lg:mt-[18px] lg:text-[17px]">{item.summary}</p>
      )}
      <ItemMeta item={item} at={card.anchorAt} />
      {showGroup && <SourceGroupLead group={group!} parentId={item.id} filters={filters} />}
    </section>
  );
}

function SecondaryColumn({ cards }: { cards: TimelineCard[] }) {
  return (
    <section className="src-front-col src-front-col-mid max-lg:space-y-5 max-lg:border-b max-lg:border-line max-lg:pb-5 max-lg:mb-5" aria-label="次要报道">
      {cards.map((card, i) => (
        <SecondaryItem key={card.key} card={card} divider={i > 0} />
      ))}
    </section>
  );
}

function SecondaryItem({ card, divider }: { card: TimelineCard; divider: boolean }) {
  const { item } = card;
  const read = useReadSet().has(item.id);
  return (
    <article className={divider ? "border-t border-line pt-[22px] max-lg:pt-5" : ""}>
      <Kicker item={item} />
      <h3 className="text-[17px] font-bold leading-[1.35] text-ink lg:text-[19px] lg:font-[750]">
        <IntentLink viewTransition to={`/items/${item.id}`} onClick={() => openItem(item, markRead)} className={`hover:text-accent ${read ? "text-ink-3" : ""}`}>
          {item.title}
        </IntentLink>
      </h3>
      {item.summary && (
        <p className="mt-2.5 line-clamp-2 text-[14px] leading-[1.6] text-ink-2 lg:line-clamp-3 lg:text-[14.5px]">{item.summary}</p>
      )}
      <div className="mt-2 lg:mt-2.5">
        <ItemMeta item={item} at={card.anchorAt} />
      </div>
    </article>
  );
}

function LatestColumn({ cards }: { cards: TimelineCard[] }) {
  return (
    <section className="src-front-col src-front-col-latest" aria-labelledby="src-latest-heading">
      <h2 id="src-latest-heading" className="src-col-heading">
        最新
      </h2>
      <ul>
        {cards.map((card) => (
          <LatestItem key={card.key} card={card} />
        ))}
      </ul>
    </section>
  );
}

function LatestItem({ card }: { card: TimelineCard }) {
  const { item } = card;
  const read = useReadSet().has(item.id);
  return (
    <li className="border-b border-line py-3.5 first:pt-0 lg:py-[14px]">
      <h3 className="text-[15px] font-[680] leading-[1.4]">
        <IntentLink viewTransition to={`/items/${item.id}`} onClick={() => openItem(item, markRead)} className={`hover:text-accent ${read ? "text-ink-3" : "text-ink"}`}>
          {item.title}
        </IntentLink>
      </h3>
      <ItemMeta item={item} at={card.anchorAt} />
    </li>
  );
}

export function SourceFront({ cards, filters }: { cards: TimelineCard[]; filters?: TimelineFilters }) {
  if (cards.length === 0) return null;
  const lead = cards[0]!;
  const secondary = cards.slice(1, 3);
  const latest = cards.slice(3, 7);
  return (
    <section className="src-container" aria-label="头版">
      <div className="src-front">
        <div className="src-front-grid">
          <LeadColumn card={lead} filters={filters} />
          {secondary.length > 0 && <SecondaryColumn cards={secondary} />}
          {latest.length > 0 && <LatestColumn cards={latest} />}
        </div>
      </div>
    </section>
  );
}
