import { Link, useLocation } from "react-router";
import { SITE } from "@aihot/site";
import { IntentLink } from "../ui/IntentLink";
import { beijingDate, beijingWeekday } from "@aihot/contracts/time";
import { monthDay } from "../../lib/format";
import { primaryNav, sidebarIsActive, type NavItem } from "./nav";
import { IconSearch } from "../icons";
import { openSearch } from "../../features/search/SearchOverlay";
import { MoreMenu } from "./MoreMenu";

function MastNavLink({ item }: { item: NavItem }) {
  const { pathname } = useLocation();
  const active = sidebarIsActive(item, pathname);
  return (
    <IntentLink
      to={item.to}
      aria-current={active ? "page" : undefined}
      className={active ? "font-semibold text-accent" : "text-ink-2 transition-colors hover:text-ink"}
    >
      {item.label}
    </IntentLink>
  );
}

function MastheadWordmark({ home }: { home: boolean }) {
  const inner = (
    <>
      Chip<span className="text-accent">HOT</span>
    </>
  );
  if (home) {
    return (
      <h1 className="src-wordmark">
        <Link to="/" className="text-inherit" aria-label={`${SITE.name} 首页`}>
          {inner}
        </Link>
      </h1>
    );
  }
  return (
    <Link to="/" className="src-wordmark" aria-label={`${SITE.name} 首页`}>
      {inner}
    </Link>
  );
}

/** Source-style newspaper masthead: date, wordmark (home h1), primary nav. */
export function DayRailTopBar() {
  const { pathname } = useLocation();
  const home = pathname === "/";
  const today = beijingDate(Date.now());
  const dateLine = `${monthDay(today)} ${beijingWeekday(today)}`;
  const items = primaryNav();

  return (
    <header className="src-masthead sticky top-0 z-50 bg-bg">
      <div className="src-container src-masthead-grid">
        <div className="src-masthead-date">
          <MastheadDate dateLine={dateLine} tagline={SITE.tagline} />
        </div>
        <div className="justify-self-center">
          <MastheadWordmark home={home} />
        </div>
        <div className="flex items-center justify-end gap-2 lg:gap-3">
          <nav className="src-nav-primary" aria-label="主路径">
            {items.map((item) => (
              <MastNavLink key={item.to} item={item} />
            ))}
          </nav>
          <button
            type="button"
            onClick={(event) => openSearch("", event.currentTarget)}
            className="grid size-9 place-items-center text-ink-3 hover:text-ink"
            aria-label="搜索"
          >
            <IconSearch size={18} />
          </button>
          <MoreMenu />
        </div>
      </div>
    </header>
  );
}

function MastheadDate({ dateLine, tagline }: { dateLine: string; tagline: string }) {
  return (
    <>
      <div>{dateLine}</div>
      <div>{tagline}</div>
    </>
  );
}
