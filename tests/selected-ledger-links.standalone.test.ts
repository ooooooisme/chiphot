import assert from "node:assert/strict";
import { test } from "node:test";
import { LIST_READING } from "@aihot/site";
import type { V1ItemPayload } from "../packages/backend/src/publication/publish.ts";
import { refreshStoredSelectedLinks } from "../packages/backend/src/publication/v1.ts";
import { itemUrl } from "../packages/backend/src/publication/links.ts";

test("refreshStoredSelectedLinks rewrites stale ledger links.aihot", { skip: !LIST_READING?.hideDetailPages }, () => {
  const id = "p48t0abewh49jjzcb5tjru1ji";
  const stale: V1ItemPayload = {
    id,
    title: "Fixture",
    originalTitle: null,
    summary: "s",
    source: { name: "Src" },
    links: { aihot: `https://new.chiphot.com/items/${id}`, original: "https://example.org/a" },
    publishedAt: null,
    discoveredAt: "2026-11-20T00:00:00.000Z",
    category: "memory",
    score: 80,
    selected: true,
    reason: null,
    attribution: { name: "热芯网", url: `https://new.chiphot.com/items/${id}` },
  };
  const fresh = refreshStoredSelectedLinks(stale);
  const expected = itemUrl(id, { selected: true });
  assert.equal(fresh.links.aihot, expected);
  assert.equal(fresh.attribution.url, expected);
  assert.ok(!fresh.links.aihot.includes("/items/"));
});