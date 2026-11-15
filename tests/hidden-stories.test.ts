// Publication-layer denylist: hidden stories 404 every exit and leave item pages without story links.
import "./setup.ts";
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { HIDDEN_STORY_PUBLIC_IDS } from "@aihot/site";
import { closeDb, sql } from "@aihot/backend/db";
import { stopBoss } from "@aihot/backend/jobs/queue";
import { isHiddenStory } from "@aihot/backend/publication/hidden-stories";
import { upsertMaterial } from "@aihot/backend/content/materials";
import { publishArticle } from "@aihot/backend/publication/publish";
import { resolveStory } from "@aihot/backend/publication/stories";
import { loadDiscoveryEntries } from "@aihot/backend/publication/sitemap";
import { loadItemDetail } from "@aihot/backend/publication/detail";
import { buildApp } from "../apps/api/src/app.ts";
import { tag } from "./setup.ts";

const T = tag();
const SOURCE = `test-hidden-story-${T}`;
const HIDDEN = HIDDEN_STORY_PUBLIC_IDS[0]!;
const ITEM_A = `hidden-a-${T}`;
const ITEM_B = `hidden-b-${T}`;
const OPEN_STORY = "00000000-0000-4000-8000-000000000001";
const OPEN_ITEM = `open-item-${T}`;

const app = await buildApp();
after(async () => {
  await app.close();
  await stopBoss();
  await closeDb();
});

test("hidden story ids are blocked at story resolution and sitemap discovery", async () => {
  for (const publicId of HIDDEN_STORY_PUBLIC_IDS) {
    assert.equal(isHiddenStory(publicId), true);
    assert.equal((await resolveStory(publicId)).kind, "not_found");
    const entries = await loadDiscoveryEntries(new Date());
    assert.ok(!entries.some((e) => e.loc === `/story/${publicId}`), `sitemap still lists ${publicId}`);
  }
  assert.equal(isHiddenStory("00000000-0000-4000-8000-000000000000"), false);
});

test("hidden story keeps member items public but drops story links and APIs", async () => {
  await sql`INSERT INTO sources (id, name, kind, tier, participation_mode, site_fulltext, syndicate_fulltext, next_fetch_at)
            VALUES (${SOURCE}, 'Hidden story source', 'rss', 'T1', 'editorial', true, true, '2100-01-01')`;
  const [story] = await sql<{ id: number }[]>`
    INSERT INTO stories (public_id, title, first_report_at, latest_at)
    VALUES (${HIDDEN}::uuid, ${"TME Arduino VENTUNO"}, now(), now()) RETURNING id`;
  const [open] = await sql<{ id: number }[]>`
    INSERT INTO stories (public_id, title, first_report_at, latest_at)
    VALUES (${OPEN_STORY}::uuid, ${`open-${T}`}, now(), now()) RETURNING id`;
  const factHidden = (await sql<{ id: number }[]>`
    INSERT INTO facts (public_id, story_id, title) VALUES (${`fact-h-${T}`}, ${story!.id}, ${"fact"}) RETURNING id`)[0]!;
  const factOpen = (await sql<{ id: number }[]>`
    INSERT INTO facts (public_id, story_id, title) VALUES (${`fact-o-${T}`}, ${open!.id}, ${"fact"}) RETURNING id`)[0]!;

  for (const [id, factId, title] of [[ITEM_A, factHidden.id, "Member A"], [ITEM_B, factHidden.id, "Member B"], [OPEN_ITEM, factOpen.id, "Open member"]] as const) {
    const minuteAgo = new Date(Date.now() - 60_000);
  const { articleId } = await upsertMaterial({
    id,
    sourceId: SOURCE,
    url: `https://example.com/${id}`,
    title,
    bodyText: "body",
    bodyHtml: "<p>body</p>",
    bodyStatus: "ok",
    via: "fetch",
    publishedAt: minuteAgo,
    discoveredAt: minuteAgo,
  });
    await sql`INSERT INTO analyses (article_id, input_revision, origin, relevance, category, title_zh, summary_zh, reason_zh, score, selected)
              VALUES (${articleId}, 1, 'rule', 'pass', 'manufacturing', ${title}, ${"summary"}, '理由', 90, true)`;
    await sql`UPDATE articles SET grouping_status = 'complete' WHERE id = ${articleId}`;
    await sql`INSERT INTO fact_articles (fact_id, article_id, role) VALUES (${factId}, ${articleId}, 'report')`;
    await publishArticle(articleId, { releasedAt: minuteAgo });
  }

  for (const id of [ITEM_A, ITEM_B]) {
    const detail = await loadItemDetail(id);
    assert.equal(detail.kind, "found");
    assert.equal(detail.item.story, null, `${id} still links to hidden story`);
    assert.ok(!JSON.stringify(detail.item).includes(HIDDEN), `${id} body still mentions hidden publicId`);
  }

  for (const url of [
    `/api/site/stories/${HIDDEN}`,
    `/api/v1/stories/${HIDDEN}`,
    `/api/v1/agent/stories/${HIDDEN}?limit=3`,
  ]) {
    const res = await app.inject({ method: "GET", url });
    assert.equal(res.statusCode, 404, url);
  }

  assert.equal((await app.inject({ method: "GET", url: `/api/site/stories/${OPEN_STORY}` })).statusCode, 200, "unblocked story remains available");
  assert.equal((await app.inject({ method: "GET", url: `/api/site/items/${ITEM_A}` })).statusCode, 200);
});