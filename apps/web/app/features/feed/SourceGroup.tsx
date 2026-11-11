import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import type { GroupInfo, GroupReport, TimelineFilters } from "@aihot/contracts/site";
import { Collapse } from "../../components/ui/Presence";
import { monthDayTime } from "../../lib/format";
import { listPath, filterParams } from "../../lib/seo";
import { useReadSet } from "../../lib/local-state";
import { readTone } from "./parts";

const reportsUrl = (factId: string, filters: TimelineFilters | undefined) =>
  listPath(`/api/site/groups/${encodeURIComponent(factId)}/reports`, filters ? filterParams(filters) : {});

/** Lead-story duplicate-source control (Source-style green rule link). */
export function SourceGroupLead({ group, parentId, filters }: { group: GroupInfo; parentId: string; filters?: TimelineFilters }) {
  const [open, setOpen] = useState(false);
  const [reports, setReports] = useState<GroupReport[] | null>(null);
  const [loading, setLoading] = useState(false);
  const url = reportsUrl(group.factId, filters);
  const entry = useLocation().key;

  useEffect(() => {
    if (!open || reports || loading) return;
    setLoading(true);
    void fetch(url)
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data: { reports: GroupReport[] }) => setReports(data.reports))
      .catch(() => setReports([]))
      .finally(() => setLoading(false));
  }, [open, reports, loading, url, entry]);

  if (group.additionalSourceCount <= 0) return null;
  const others = (reports ?? []).filter((r) => r.id !== parentId);
  const read = useReadSet();

  return (
    <div>
      <button type="button" className="src-group-link" aria-expanded={open} onClick={() => setOpen(!open)}>
        另外 {group.additionalSourceCount} 家也报道了 →
      </button>
      <Collapse open={open}>
        <ul className="mt-2 space-y-2 border-t border-line pt-3">
          {loading && !reports && <li className="text-[12.5px] text-ink-3">加载中…</li>}
          {others.map((r) => (
            <li key={r.id} className="text-[13px]">
              <Link viewTransition to={`/items/${r.id}`} className={`hover:text-accent ${readTone(read.has(r.id), "text-ink-2")}`}>
                {r.title}
              </Link>
              <span className="ml-2 text-ink-3">
                {r.source.name} · {monthDayTime(r.timelineAt)}
              </span>
            </li>
          ))}
        </ul>
      </Collapse>
    </div>
  );
}
