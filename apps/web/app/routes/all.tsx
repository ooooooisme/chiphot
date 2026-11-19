import { redirect } from "react-router";
import type { Route } from "./+types/all";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  url.pathname = "/";
  url.searchParams.set("feed", "all");
  if (url.searchParams.get("page") === "1") url.searchParams.delete("page");
  const target = url.search ? `${url.pathname}?${url.searchParams}` : url.pathname;
  throw redirect(target, { status: 308 });
}

export default function AllRedirect() {
  return null;
}