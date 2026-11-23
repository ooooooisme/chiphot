import { Link, useRouteLoaderData } from "react-router";
import { SITE } from "@aihot/site";

/** Source shell site footer — display name only (zh: 热芯网). */
export function DayRailFooter() {
  const root = useRouteLoaderData("root") as { release?: string | null } | undefined;
  const release = root?.release;
  const version =
    release && release !== "dev" ? (release.startsWith("v") ? release : `v${release.split("+")[0]}`) : null;
  return (
    <footer className="src-site-footer border-t border-line bg-bg">
      <div className="src-container flex flex-wrap items-center justify-between gap-3 py-8 text-[12.5px] text-ink-3">
        <Link to="/" className="font-semibold text-ink hover:text-accent">
          {SITE.name}
        </Link>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <Link to="/about" className="hover:text-ink">
            关于
          </Link>
          <Link to="/daily" className="hover:text-ink">
            日报
          </Link>
          <Link to="/feedback" className="hover:text-ink">
            反馈
          </Link>
        </div>
        <span className="w-full text-ink-4 lg:w-auto">
          {SITE.footerNote}
          {version ? (
            <>
              <span className="mx-2" aria-hidden="true">
                ·
              </span>
              {version}
            </>
          ) : null}
        </span>
      </div>
    </footer>
  );
}