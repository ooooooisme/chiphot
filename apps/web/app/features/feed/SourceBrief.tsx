import type { FeedItemSummary } from "@aihot/contracts/site";
import { sourceListTime } from "../../lib/format";
import { composeItemBrief } from "../../lib/brief";

export function BriefParagraph({ summary, reason, className }: { summary: string | null | undefined; reason: string | null | undefined; className: string }) {
  const { text } = composeItemBrief(summary, reason);
  if (!text) return null;
  return <p className={className}>{text}</p>;
}

export function BriefInsufficient({ summary, reason }: { summary: string | null | undefined; reason: string | null | undefined }) {
  const { insufficient } = composeItemBrief(summary, reason);
  if (!insufficient) return null;
  return <span className="src-list-mute">简评不足</span>;
}

export function OriginalSourceLink({ item, className = "src-list-mute hover:text-accent" }: { item: FeedItemSummary; className?: string }) {
  const href = item.links?.original;
  if (!href) return null;
  const label = item.channel === "x" && item.x ? item.x.authorName : item.source.name;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {label}
    </a>
  );
}

export function ListTitle({ item, className, read }: { item: FeedItemSummary; className: string; read?: boolean }) {
  return <span className={`${read ? "text-ink-3" : ""} ${className}`}>{item.title}</span>;
}

export function ItemMetaRow({ item, at, showInsufficient }: { item: FeedItemSummary; at: string; showInsufficient?: boolean }) {
  return (
    <>
      <time dateTime={at}>{sourceListTime(at)}</time>
      <span aria-hidden="true">·</span>
      <OriginalSourceLink item={item} />
      {showInsufficient !== false && <BriefInsufficient summary={item.summary} reason={item.reason} />}
    </>
  );
}