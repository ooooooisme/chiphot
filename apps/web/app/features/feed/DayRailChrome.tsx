// Category navigation row for the Source Day Rail shell.
import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { CATEGORY_KEYS, CATEGORY_LABELS, CHANNEL_LABELS, type CategoryKey, type ChannelKey } from "@aihot/contracts/taxonomy";

function hrefWith(base: string, params: URLSearchParams, patch: Record<string, string | null>) {
  const sp = new URLSearchParams(params);
  for (const [k, v] of Object.entries(patch)) {
    if (v === null || v === "") sp.delete(k);
    else sp.set(k, v);
  }
  sp.delete("page");
  sp.delete("cursor");
  const s = sp.toString();
  return s ? `${base}?${s}` : base;
}

function activeKey(category: CategoryKey | null, channel: ChannelKey): string {
  if (channel === "firstParty") return "firstParty";
  return category ?? "all";
}

export function DayRailFeedChrome({
  base,
  category,
  channel = "all",
}: {
  base: "/" | "/all";
  category: CategoryKey | null;
  channel?: ChannelKey;
}) {
  const [params] = useSearchParams();
  const [sheet, setSheet] = useState(false);
  const active = activeKey(category, channel);
  const filtered = active !== "all";

  const links = [
    { key: "all", label: "全部", to: hrefWith(base, params, { category: null, channel: null }) },
    ...CATEGORY_KEYS.map((k) => ({ key: k, label: CATEGORY_LABELS[k], to: hrefWith(base, params, { category: k, channel: null }) })),
  ];

  const extraOptions = [
    { key: "firstParty", label: CHANNEL_LABELS.firstParty, to: hrefWith(base, params, { category: null, channel: "firstParty" }) },
  ];

  return (
    <>
      <div className="src-cat-nav bg-bg">
        <CatNavRow>
          <nav aria-label="分类" className="src-cat-scroll min-w-0 flex-1">
            {links.map((l) => {
              const on = l.key === active;
              return (
                <Link
                  key={l.key}
                  to={l.to}
                  aria-current={on ? "page" : undefined}
                  className={`shrink-0 pb-0.5 text-[14.5px] transition-colors ${
                    on ? "border-b-2 border-accent font-bold text-ink" : "font-[550] text-ink-2 hover:text-ink"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
          <button
            type="button"
            onClick={() => setSheet(true)}
            className={`hidden shrink-0 self-center pb-1 text-[13px] sm:inline ${
              filtered ? "font-medium text-accent" : "font-normal text-ink-3 hover:text-ink-2"
            }`}
          >
            筛选{filtered ? " · 已选" : ""}
          </button>
        </CatNavRow>
      </div>
      {sheet && (
        <div className="fixed inset-0 z-[55] sm:hidden" role="dialog" aria-modal="true">
          <button type="button" className="absolute inset-0 bg-ink/20" aria-label="关闭" onClick={() => setSheet(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[70dvh] overflow-y-auto border-t border-line bg-bg px-4 pb-6 pt-4">
            <div className="mb-3 text-[15px] font-bold text-ink">筛选</div>
            <ul className="divide-y divide-line-soft">
              {[...links, ...extraOptions].map((o) => (
                <li key={o.key}>
                  <Link
                    to={o.to}
                    onClick={() => setSheet(false)}
                    className={`flex h-11 items-center text-[15px] ${o.key === active ? "font-semibold text-ink" : "text-ink-3"}`}
                  >
                    {o.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}

function CatNavRow({ children }: { children: React.ReactNode }) {
  return <div className="src-container flex items-center gap-3 lg:justify-center">{children}</div>;
}
