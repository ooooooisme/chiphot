import { redirect, useLoaderData, useSearchParams } from "react-router";
import type { Route } from "./+types/home";
import type { PoolResponse, ReportLatestPage, TimelineResponse } from "@aihot/contracts/site";
import { LIST_READING, SITE } from "@aihot/site";
import { apiGet, cachedPage, loadOr404 } from "../lib/api.server";
import { pageReuse } from "../lib/page-reuse";
import { filterParams, hasFeedFilters, itemListLd, listPath, pageMeta, readFilters, siteLd } from "../lib/seo";
import { inNav } from "../components/shell/nav";
import type { Screen } from "../components/shell/screens";
import { Timeline } from "../features/feed/Timeline";
import { HotTopics } from "../features/feed/HotTopics";
import { ActiveFilters, CategoryTabs, FeedBar, SearchField } from "../features/feed/Filters";
import { DailyReportStrip } from "../features/feed/DailyReportStrip";
import { DayRailFeedChrome } from "../features/feed/DayRailChrome";
import { SOURCE_FRONT_USED, SourceFront } from "../features/feed/SourceFront";
import { SourceEarlierFromItems } from "../features/feed/SourceList";
import { Pagination } from "../features/feed/DayList";
import { EmptyState } from "../components/ui/Page";
import { isDayRailShell } from "../lib/visitor-shell";

export const handle: Screen = { tab: "featured", name: "精选" };
export { pageHeaders as headers } from "../lib/api.server";
export const { clientLoader, shouldRevalidate } = pageReuse<typeof loader>();

function pageHref(params: URLSearchParams, page: number) {
  const sp = new URLSearchParams(params);
  if (page <= 1) sp.delete("page");
  else sp.set("page", String(page));
  const s = sp.toString();
  return s ? `/?${s}` : "/";
}

function canonicalListPath(
  feed: "all" | "selected",
  page: number,
  filters: ReturnType<typeof readFilters>,
  q: string | null,
  tab: "time" | "relevance",
) {
  return listPath("/", {
    ...filterParams(filters),
    feed: feed === "all" ? "all" : null,
    q,
    tab: q && tab === "relevance" ? "relevance" : null,
    page: page > 1 ? page : null,
  });
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim();
  const dayRail = isDayRailShell();
  const listOnly = LIST_READING?.hideDetailPages && dayRail;

  if (listOnly) {
    if (url.searchParams.get("page") === "1") {
      const sp = new URLSearchParams(url.searchParams);
      sp.delete("page");
      const rest = sp.toString();
      throw redirect(rest ? `/?${rest}` : "/", { status: 308 });
    }
    if (q) {
      const sp = new URLSearchParams(url.searchParams);
      sp.set("feed", "all");
      throw redirect(`/?${sp}`);
    }
    const filters = readFilters(url.searchParams);
    const feed: "all" | "selected" = url.searchParams.get("feed") === "all" ? "all" : "selected";
    const page = Math.min(Math.max(Number.parseInt(url.searchParams.get("page") ?? "1", 10) || 1, 1), 50);
    const upstream = new Headers();
    const [data, dailyLatest] = await Promise.all([
      loadOr404<PoolResponse>(
        listPath("/api/site/pool", {
          ...filterParams(filters),
          feed: feed === "selected" ? "selected" : null,
          page: page > 1 ? page : null,
        }),
        { responseHeaders: upstream, signal: request.signal, busyRedirect: `/search-busy${url.search}` },
      ),
      apiGet<ReportLatestPage>("/api/site/reports/daily/latest-page", { signal: request.signal }).catch(() => null),
    ]);
    if (data.total > 0 && data.page > data.pageCount) {
      throw redirect(pageHref(url.searchParams, data.pageCount));
    }
    const dailyStrip = dailyLatest?.report?.key ? { href: "/daily", issueDate: dailyLatest.report.key } : null;
    return cachedPage(60, { list: true as const, data, filters, feed, dailyStrip }, upstream);
  }

  if (q) throw redirect(`/all${url.search}`);
  const filters = readFilters(url.searchParams);
  const upstream = new Headers();
  const [data, dailyLatest] = await Promise.all([
    loadOr404<TimelineResponse>(listPath("/api/site/timeline", filterParams(filters)), { responseHeaders: upstream, signal: request.signal }),
    dayRail ? apiGet<ReportLatestPage>("/api/site/reports/daily/latest-page", { signal: request.signal }).catch(() => null) : Promise.resolve(null),
  ]);
  const dailyStrip = dailyLatest?.report?.key ? { href: "/daily", issueDate: dailyLatest.report.key } : null;
  return cachedPage(60, { list: false as const, data, filters, dailyStrip }, upstream);
}

export function meta({ loaderData }: Route.MetaArgs) {
  if (loaderData?.list) {
    const { data, filters, feed } = loaderData;
    const page = data.page;
    const path = canonicalListPath(feed, page, filters, data.filters.q, data.filters.tab);
    const titles = data.items.map((i) => i.title);
    const listName = feed === "all" ? "全部" : "精选";
    return pageMeta({
      title: page > 1 ? `${SITE.homeTitle} · 第 ${page} 页` : undefined,
      rawTitle: page > 1,
      path,
      noindex: hasFeedFilters(filters) || !!data.filters.q,
      jsonLd: hasFeedFilters(filters) || data.filters.q ? undefined : [...siteLd(), itemListLd(path, listName, titles)],
    });
  }
  const path = listPath("/", loaderData ? filterParams(loaderData.filters) : {});
  const titles = loaderData && !loaderData.list ? loaderData.data.cards.map((c) => c.item.title) : [];
  return pageMeta({ path, noindex: hasFeedFilters(loaderData?.filters), jsonLd: path === "/" ? [...siteLd(), itemListLd("/", "精选", titles)] : undefined });
}

function ListHome() {
  const loaderData = useLoaderData<typeof loader>();
  if (!loaderData.list) return null;
  const { data: pool, filters, feed, dailyStrip } = loaderData;
  const [params] = useSearchParams();
  const showFront = pool.page === 1 && !hasFeedFilters(filters) && !filters.category && filters.channel === "all" && !pool.filters.q;
  const front = showFront ? pool.items.slice(0, SOURCE_FRONT_USED) : [];
  const earlier = showFront ? pool.items.slice(SOURCE_FRONT_USED) : pool.items;

  return (
    <>
      <DayRailFeedChrome category={filters.category} channel={filters.channel} />
      <h1 data-page-title="" className="sr-only">
        {feed === "all" ? "全部" : "精选"}
      </h1>
      {dailyStrip && <DailyReportStrip href={dailyStrip.href} issueDate={dailyStrip.issueDate} />}
      {pool.items.length === 0 ? (
        <div className="src-container py-8">
          <EmptyState title={feed === "all" ? "暂时没有公开条目" : "这一类暂时没有精选"}>
            {hasFeedFilters(filters) ? "换个分类再试。" : "过一会儿再来。"}
          </EmptyState>
        </div>
      ) : (
        <>
          {front.length > 0 && <SourceFront items={front} filters={pool.filters} />}
          {earlier.length > 0 && <SourceEarlierFromItems items={earlier} />}
        </>
      )}
      <Pagination page={pool.page} pageCount={pool.pageCount} href={(p) => pageHref(params, p)} />
    </>
  );
}

export default function Home() {
  const loaderData = useLoaderData<typeof loader>();
  if (loaderData.list && isDayRailShell()) {
    return (
      <div className="pb-6">
        <ListHome />
      </div>
    );
  }

  const { data, filters, dailyStrip } = loaderData as Extract<typeof loaderData, { list: false }>;
  const title = filters.tag ? `#${filters.tag}` : "精选";
  const dayRail = isDayRailShell();
  return (
    <div className="pb-6">
      {dayRail ? (
        <DayRailFeedChrome category={filters.category} channel={filters.channel} />
      ) : (
        <>
          <FeedBar base="/" category={filters.category} channel={filters.channel} />
          <ActiveFilters base="/" category={filters.category} channel={filters.channel} tag={filters.tag} />
          <div className="hidden lg:block">
            <h1 className="text-[24px] font-semibold leading-[1.3] text-ink">{title}</h1>
            <div className="mb-5 mt-4 flex items-center justify-between gap-4">
              <CategoryTabs base="/" category={filters.category} channel={filters.channel} layoutId="home-cat-desk" className="min-w-0" />
              <SearchField keep={{ category: filters.category }} />
            </div>
          </div>
        </>
      )}
      {data.hot && inNav("/hot") && !dayRail && <HotTopics entries={data.hot} />}
      {dayRail && dailyStrip && <DailyReportStrip href={dailyStrip.href} issueDate={dailyStrip.issueDate} />}
      <Timeline initial={data} filters={data.filters} />
    </div>
  );
}