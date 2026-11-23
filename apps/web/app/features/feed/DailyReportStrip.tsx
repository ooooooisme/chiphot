import { Link } from "react-router";

/** Daily report band aligned with items on this list page (Source-style rule, no card). */
export function DailyReportStrip({ href, label }: { href: string; label: string }) {
  return (
    <Link to={href} className="src-daily-strip block transition-opacity hover:opacity-80">
      {label}
    </Link>
  );
}