// One report in a feed. Desktop (≥ 961px): a white card beside the time rail. Phones: a compact row with
// the time in the source line, the bookmark at hand, the reason in one line and duplicate reports
// behind one button that opens a sheet. One markup, two presentations.
import { memo } from "react";
import { Link } from "react-router";
import { IntentLink } from "../../components/ui/IntentLink";
import type { GroupInfo, FeedItemSummary, TimelineFilters } from "@aihot/contracts/site";
import { CATEGORY_LABELS } from "@aihot/contracts/taxonomy";
import { ITEM_COPY } from "@aihot/site";
import { SameEventBadge, SelectedBadge } from "../../components/ui/Badge";
import { ScoreLabel } from "../../components/ui/Score";
import { beijingTime } from "@aihot/contracts/time";
import { MediaThumbs, SourceLine, StarButton, readTone } from "./parts";
import { GroupButton, GroupSources } from "./ReadingGroup";
import { QuotedLine } from "../item/QuotedPost";
import { rememberPreview } from "../item/preview";
import { isDayRailShell } from "../../lib/visitor-shell";

export interface FeedItemProps {
  item: FeedItemSummary;
  group?: GroupInfo | null;
  filters?: TimelineFilters;
  read?: boolean;
  onOpen?: (id: string) => void;
  /** Show category and tags under the text (全部动态, topics, search). */
  showTags?: boolean;
  /** The time the item sits at in its list; phones show it in the source line (desktop: on the rail). */
  at?: string;
}

function IndustryPill({ category }: { category: string }) {
  return (
    <span className="inline-flex h-5 items-center rounded-full border border-[var(--ch-pill-industry-border,rgba(20,20,20,0.14))] bg-[var(--ch-pill-industry-bg,#fff)] px-1.5 text-[10px] font-medium text-[var(--ch-pill-industry-fg,rgba(20,20,20,0.62))]">
      {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}
    </span>
  );
}

function PickPill() {
  return (
    <span className="inline-flex h-5 items-center rounded-full bg-[var(--ch-pill-pick-bg,#FEF3C7)] px-1.5 text-[10px] font-semibold text-[var(--ch-pill-pick-fg,#B45309)]">
      精选
    </span>
  );
}

export const FeedItem = memo(function FeedItem({ item, group, filters, read = false, onOpen, showTags = false, at }: FeedItemProps) {
  const dayRail = isDayRailShell();
  const isX = item.channel === "x" && !!item.x;
  const open = () => {
    rememberPreview(item);
    onOpen?.(item.id);
  };
  const showSources = !!group && (group.additionalSourceCount > 0 || group.reportCount > 1);
  const tags = showTags ? item.tags.slice(0, 3) : [];

  if (dayRail) {
    return (
      <article
        className="relative min-w-0 rounded-[var(--ch-card-radius,12px)] border border-line bg-[var(--ch-card,var(--surface))] px-4 py-3.5 transition-shadow hover:shadow-[0_4px_14px_rgba(20,20,20,0.06)] lg:px-4 lg:py-3.5"
        data-item-id={item.id}
      >
        <header className="flex flex-wrap items-center gap-1.5 text-[11px] font-medium leading-snug text-ink-3">
          <SourceLine item={item} className="text-ink-3" />
          {item.selected && !item.sameEvent && <PickPill />}
          {item.sameEvent && <SameEventBadge />}
          {item.category && <IndustryPill category={item.category} />}
          <span className="ml-auto inline-flex">
            <StarButton item={item} className="size-8 lg:size-[26px]" />
          </span>
        </header>
        {isX ? (
          item.summary ? (
            <p className={`mt-1.5 line-clamp-4 text-[15px] leading-[1.65] lg:text-[16px] ${readTone(read, "text-ink")}`}>
              <IntentLink viewTransition to={`/items/${item.id}`} onClick={open} className="after:absolute after:inset-0 after:content-['']">
                {item.summary}
              </IntentLink>
            </p>
          ) : (
            <IntentLink viewTransition to={`/items/${item.id}`} onClick={open} aria-label={`查看 ${item.x!.authorName} 的帖子`} className="absolute inset-0" />
          )
        ) : (
          <>
            <h3 className={`mt-1.5 line-clamp-3 text-[16px] font-[650] leading-[1.35] text-ink lg:text-[17px] ${readTone(read, "text-ink")}`}>
              <IntentLink viewTransition to={`/items/${item.id}`} onClick={open} className="after:absolute after:inset-0 after:content-[''] hover:text-accent">
                {item.title}
              </IntentLink>
            </h3>
            {item.summary && <p className="mt-1 line-clamp-2 text-[12.5px] leading-[1.5] text-ink-3 lg:line-clamp-3 lg:text-[13px]">{item.summary}</p>}
          </>
        )}
        {item.reason && (
          <p className="relative z-10 mt-2 line-clamp-2 text-[12.5px] leading-[1.5] text-note lg:line-clamp-3">{`${ITEM_COPY.reasonLabel}：`}{item.reason}</p>
        )}
        {group && showSources && <GroupButton group={group} filters={filters} parentId={item.id} />}
      </article>
    );
  }

  return (
    <article className="relative min-w-0 lg:card lg:card-hover lg:px-[18px] lg:pb-[14px] lg:pt-[15px]" data-item-id={item.id}>
      <header className="flex min-h-[22px] items-center gap-1.5 text-[12.5px] leading-[18px] text-ink-4 lg:min-h-[18px] lg:gap-2">
        <SourceLine item={item} className="text-ink-4" />
        {at && !dayRail && (
          <time dateTime={at} className="mono shrink-0 text-[12px] lg:hidden">
            · {beijingTime(at)}
          </time>
        )}
        {item.selected && (
          <span className="hidden lg:inline-flex">
            {item.sameEvent ? <SameEventBadge /> : <SelectedBadge />}
          </span>
        )}
        <span className="ml-auto flex shrink-0 items-center gap-1 pl-2 lg:gap-1.5">
          <span className="hidden lg:inline-flex">
            <ScoreLabel score={item.score} />
          </span>
          <span className="lg:hidden">
            <ScoreLabel score={item.score} compact />
          </span>
          <span className="-my-[11px] -mr-3 inline-flex lg:-my-1 lg:mr-0">
            <StarButton item={item} className="size-11 lg:size-[26px]" />
          </span>
        </span>
      </header>

      {isX ? (
        item.summary ? <p className={`mt-1.5 whitespace-pre-line text-[15px] leading-[1.75] line-clamp-5 lg:mt-2 lg:line-clamp-4 ${readTone(read, "text-ink")}`}>
          <IntentLink viewTransition to={`/items/${item.id}`} onClick={open} className="after:absolute after:inset-0 after:content-['']">
            {item.summary}
          </IntentLink>
        </p> : <IntentLink viewTransition to={`/items/${item.id}`} onClick={open} aria-label={`查看 ${item.x!.authorName} 的帖子`} className="absolute inset-0" />
      ) : (
        <>
          <h3 className={`mt-1.5 line-clamp-2 text-[17px] font-[650] leading-[1.5] lg:mt-2 lg:line-clamp-none lg:leading-[1.55] ${readTone(read, "text-ink")}`}>
            <IntentLink viewTransition to={`/items/${item.id}`} onClick={open} className="after:absolute after:inset-0 after:content-['']">
              {item.title}
            </IntentLink>
          </h3>
          {item.summary && <p className="mt-1 line-clamp-2 text-[14.5px] leading-[1.7] text-ink-3 lg:mt-2 lg:line-clamp-3 lg:text-[15px] lg:leading-[1.75]">{item.summary}</p>}
        </>
      )}

      {isX && item.x!.media.length > 0 && <MediaThumbs media={item.x!.media} className="mt-2.5" />}
      {isX && item.x!.quoted?.text && <QuotedLine quoted={item.x!.quoted} />}

      {(tags.length > 0 || (showTags && item.category)) && (
        <div className="relative z-10 mt-2 hidden flex-wrap gap-x-2.5 gap-y-1 text-[12px] text-ink-4 lg:flex">
          {showTags && item.category && (
            <Link to={`/all?category=${item.category}`} className="hover:text-accent">
              {CATEGORY_LABELS[item.category]}
            </Link>
          )}
          {tags.map((t) => (
            <Link key={t} to={`/all?tag=${encodeURIComponent(t)}`} className="hover:text-accent">
              #{t}
            </Link>
          ))}
        </div>
      )}

      {item.sameEvent && (
        <p className="relative z-10 mt-2 line-clamp-1 text-[12.5px] text-ink-4">
          同一件事，精选收录的是
          <Link viewTransition to={`/items/${item.sameEvent.id}`} className="text-ink-3 transition-colors hover:text-accent">
            《{item.sameEvent.title}》
          </Link>
        </p>
      )}
      {group && showSources && (
        <div className="mt-2 hidden lg:block">
          <GroupSources group={group} filters={filters} parentId={item.id} />
        </div>
      )}

      {item.reason && (
        <div className="mt-1 lg:mt-3 lg:border-t lg:border-line-soft lg:pt-3">
          <p className="line-clamp-1 text-[13px] leading-[1.65] text-note lg:line-clamp-none lg:leading-[1.75]">{`${ITEM_COPY.reasonLabel}：`}{item.reason}</p>
        </div>
      )}

      {/* Phones: duplicate reports open in a sheet. */}
      {group && showSources && <GroupButton group={group} filters={filters} parentId={item.id} />}
    </article>
  );
});
