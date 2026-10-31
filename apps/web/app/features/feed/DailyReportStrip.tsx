import { Link } from "react-router";
import { monthDay } from "../../lib/format";

/** Homepage strip above the day rail; hidden when there is no daily issue to link to. */
export function DailyReportStrip({ href, issueDate, today }: { href: string; issueDate: string; today: string }) {
  const dated = issueDate === today;
  const label = dated ? `今日日报 · ${monthDay(issueDate).replace(/(\d+)月(\d+)日/, "$1 月 $2 日")}` : "最近一期日报";
  return (
    <Link
      to={href}
      className="mb-3 flex h-10 items-center justify-between rounded-[10px] border border-dashed border-accent bg-accent-soft px-3 text-[13px] font-semibold text-accent transition-colors hover:bg-[color-mix(in_srgb,var(--ch-accent-soft,rgba(11,110,79,0.12))_70%,white)]"
    >
      <span>{label}</span>
      <span aria-hidden="true">→</span>
    </Link>
  );
}
