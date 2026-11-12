import { Link } from "react-router";
import { monthDay } from "../../lib/format";

/** Daily report band when a daily issue exists (Source-style rule, no card). */
export function DailyReportStrip({ href, issueDate }: { href: string; issueDate: string }) {
  const label = `今日日报 · ${monthDay(issueDate).replace(/(\d+)月(\d+)日/, "$1 月 $2 日")}`;
  return (
    <Link to={href} className="src-daily-strip block transition-opacity hover:opacity-80">
      {label}
    </Link>
  );
}
