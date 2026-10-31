import { redirect, useLoaderData } from "react-router";
import type { Route } from "./+types/home";
import type { ReportLatestPage, TimelineResponse } from "@aihot/contracts/site";
import { beijingDate } from "@aihot/contracts/time";
import { cachedPage, loadOr404 } from "../lib/api.server";
import { pageReuse } from "../lib/page-reuse";
import { filterParams, hasFeedFilters, itemListLd, listPath, pageMeta, readFilters, siteLd } from "../lib/seo";
import { inNav } from "../components/shell/nav";
import type { Screen } from "../components/shell/screens";
import { Timeline } from "../features/feed/Timeline";
import { HotTopics } from "../features/feed/HotTopics";
import { ActiveFilters, CategoryTabs, FeedBar, SearchField } from "../features/feed/Filters";
import { DailyReportStrip } from "../features/feed/DailyReportStrip";
import { isDayRailShell } from "../lib/visitor-shell";

export const handle: Screen = { tab: "featured", name: "精选" };
export { pageHeaders as headers } from "../lib/api.server";
export const { clientLoader, shouldRevalidate } = pageReuse<typeof loader>();

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  // Search lives on /all; keep the parameters so old links still land on results.
  if (q && q.trim()) throw redirect(`/all${url.search}`);
  const filters = readFilters(url.searchParams);
  const upstream = new Headers();
  const data = await loadOr404<TimelineResponse>(listPath("/api/site/timeline", filterParams(filters)), { responseHeaders: upstream, signal: request.signal });
  const today = beijingDate(Date.now());
  let dailyStrip: { href: string; issueDate: string } | null = null;
  if (isDayRailShell()) {
    try {
      const latest = await loadOr404<ReportLatestPage>("/api/site/reports/daily/latest-page", { signal: request.signal });
      if (latest.report?.key) dailyStrip = { href: "/daily", issueDate: latest.report.key };
    } catch {
      dailyStrip = null;
    }
  }
  return cachedPage(60, { data, filters, dailyStrip, today }, upstream);
}

export function meta({ loaderData }: Route.MetaArgs) {
  const path = listPath("/", loaderData ? filterParams(loaderData.filters) : {});
  const titles = loaderData?.data.cards.map((c) => c.item.title) ?? [];
  return pageMeta({ path, noindex: hasFeedFilters(loaderData?.filters), jsonLd: path === "/" ? [...siteLd(), itemListLd("/", "精选", titles)] : undefined });
}

export default function Home() {
  const { data, filters, dailyStrip, today } = useLoaderData<typeof loader>();
  const title = filters.tag ? `#${filters.tag}` : "精选";
  const dayRail = isDayRailShell();
  return (
    <div className="pb-6">
      <FeedBar base="/" category={filters.category} channel={filters.channel} />
      <ActiveFilters base="/" category={filters.category} channel={filters.channel} tag={filters.tag} />
      {!dayRail && (
        <div className="hidden lg:block">
          <h1 className="text-[24px] font-semibold leading-[1.3] text-ink">{title}</h1>
          <div className="mb-5 mt-4 flex items-center justify-between gap-4">
            <CategoryTabs base="/" category={filters.category} channel={filters.channel} layoutId="home-cat-desk" className="min-w-0" />
            <SearchField keep={{ category: filters.category }} />
          </div>
        </div>
      )}
      {dayRail && (
        <div className="mb-3 hidden lg:block">
          <CategoryTabs base="/" category={filters.category} channel={filters.channel} layoutId="home-cat-desk" className="min-w-0" />
        </div>
      )}

      {data.hot && inNav("/hot") && <HotTopics entries={data.hot} />}

      {dayRail && dailyStrip && <DailyReportStrip href={dailyStrip.href} issueDate={dailyStrip.issueDate} today={today} />}

      <Timeline initial={data} filters={data.filters} />
    </div>
  );
}
