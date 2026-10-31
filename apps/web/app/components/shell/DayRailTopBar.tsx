import { Link, useLocation } from "react-router";
import { SITE } from "@aihot/site";
import { IntentLink } from "../ui/IntentLink";
import { IconSearch } from "../icons";
import { openSearch } from "../../features/search/SearchOverlay";
import { primaryNav, sidebarIsActive, type NavItem } from "./nav";
import { MoreMenu } from "./MoreMenu";

function NavLink({ item }: { item: NavItem }) {
  const { pathname } = useLocation();
  const active = sidebarIsActive(item, pathname);
  return (
    <IntentLink
      to={item.to}
      aria-current={active ? "page" : undefined}
      className={`text-[13px] transition-colors ${active ? "font-bold text-ink" : "font-medium text-ink-3 hover:text-ink"}`}
    >
      {item.label}
    </IntentLink>
  );
}

/** Sticky top bar: ChipHOT lockmark, 精选 / 全部 / 日报, search and more. */
export function DayRailTopBar() {
  const items = primaryNav();
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-surface">
      <div className="mx-auto flex h-12 min-h-12 max-w-[var(--ch-content-max,720px)] items-center gap-3 px-4 lg:h-[var(--ch-topbar-h,52px)] lg:min-h-[var(--ch-topbar-h,52px)] lg:gap-5 lg:px-6">
        <Link to="/" className="flex shrink-0 items-center gap-1.5 text-[15px] font-extrabold tracking-[-0.03em] text-ink lg:text-[16px]" aria-label={`${SITE.name} 首页`}>
          <span aria-hidden="true" className="size-[7px] rounded-full bg-accent" />
          {SITE.name}
        </Link>
        <nav className="flex min-w-0 flex-1 items-center gap-3 lg:gap-4" aria-label="主路径">
          {items.map((item) => (
            <NavLink key={item.to} item={item} />
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={(event) => openSearch("", event.currentTarget)}
            className="grid size-10 place-items-center rounded-control text-ink-3 transition-colors hover:bg-bg-sunk hover:text-ink lg:size-9"
            aria-label="搜索"
          >
            <IconSearch size={20} />
          </button>
          <MoreMenu />
        </div>
      </div>
    </header>
  );
}
