import { useState } from "react";
import { Link } from "react-router";
import { IconMore } from "../icons";
import { Sheet } from "../ui/Sheet";
import { secondaryNav } from "./nav";
import { useChangelogDot } from "./Sidebar";
import { useRouteLoaderData } from "react-router";

/** Agent, topics, starred, about, changelog, feedback — not in the top three. */
export function MoreMenu() {
  const [open, setOpen] = useState(false);
  const root = useRouteLoaderData("root") as { changelogVersion?: string | null } | undefined;
  const dot = useChangelogDot(root?.changelogVersion ?? null);
  const items = secondaryNav();
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="grid size-10 place-items-center rounded-control text-[18px] leading-none text-ink-3 transition-colors hover:bg-bg-sunk hover:text-ink lg:size-9"
        aria-label="更多"
      >
        <IconMore size={20} />
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title="更多">
        <ul className="mx-4 divide-y divide-line-soft pb-4">
          {items.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                onClick={() => setOpen(false)}
                className="flex h-12 items-center justify-between text-[15px] font-medium text-ink"
              >
                {item.label}
                {dot && item.changelog && <span className="size-2 rounded-full bg-hot" aria-label="有新的更新" />}
              </Link>
            </li>
          ))}
        </ul>
      </Sheet>
    </>
  );
}
