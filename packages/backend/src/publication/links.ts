import { LIST_READING } from "@aihot/site";
import { config } from "../config.ts";
import { serverModules } from "../modules.ts";

// Absolute links always use the configured address (SITE_URL), never the request Host: a CDN or proxy
// may send a different Host to the origin.
export const siteUrl = (path: string): string => `${config.siteUrl}${path}`;

const listOnly = (): boolean => LIST_READING?.hideDetailPages === true;

/** Site path to an item (relative); list-only reading uses a list anchor instead of a detail page. */
export function itemSitePath(id: string): string {
  return listOnly() ? `/#item-${id}` : `/items/${id}`;
}

export const itemUrl = (id: string): string => siteUrl(itemSitePath(id));

/** Site path to a story (relative); list-only reading prefers a representative item or /hot. */
export function storySitePath(publicId: string, representativeItemId?: string | null): string {
  if (listOnly()) {
    if (representativeItemId) return `/#item-${representativeItemId}`;
    return "/hot";
  }
  return `/story/${publicId}`;
}

export const storyUrl = (publicId: string, representativeItemId?: string | null): string =>
  siteUrl(storySitePath(publicId, representativeItemId));

export const dailyUrl = (date: string): string => siteUrl(`/daily/${date}`);
export const periodUrl = (kind: "weekly" | "monthly", key: string): string => siteUrl(`/${kind}/${key}`);

/** Where v1 links stories: the site, unless a module names another origin for now (ServerModule.storyOrigin). */
const storyOrigin = (): string => serverModules().map((m) => m.storyOrigin?.()).find((o) => o) ?? config.siteUrl;

/** A story's page as v1 links it (hot topics' links.story). */
export function v1StoryUrl(publicId: string, representativeItemId?: string | null): string {
  if (listOnly()) {
    if (representativeItemId) return itemUrl(representativeItemId);
    return v1StoryApiUrl(publicId);
  }
  return `${storyOrigin()}/story/${publicId}`;
}

/** A story's v1 address as v1 links it (related stories' links.api). */
export const v1StoryApiUrl = (publicId: string): string => `${storyOrigin()}/api/v1/stories/${publicId}`;