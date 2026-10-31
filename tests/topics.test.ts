// Topic pages: which articles a topic takes, and their counts.
// Written before the code, from the ways it can go wrong:
// - a company topic takes an article about another company that only mentions it (several subjects,
//   its name nowhere in the title), or drops one about it whose title names it in English, in another
//   case, next to Chinese text, or only by a product (it is the article's only subject);
// - a Latin name matches inside another word ("Metrology" is not Samsung); a headline naming a company
//   that is not a subject of the article gets in;
// - a technical-direction topic stops taking its tags;
// - withdrawn or not yet released articles appear in a list or a count;
// - an article or story page names a topic its reports do not belong to;
// - a topic without content has no page, or an unknown slug or a page past the end has one.
import { tag } from "./setup.ts";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, test } from "node:test";
import { closeDb, sql } from "@aihot/backend/db";
import { upsertMaterial } from "@aihot/backend/content/materials";
import { stopBoss } from "@aihot/backend/jobs/queue";
import { publishArticle } from "@aihot/backend/publication/publish";
import { TOPICS, loadTopicPage, listTopicSummaries, topicsOfStory } from "@aihot/backend/publication/topics";
import { buildApp } from "../apps/api/src/app.ts";

const T = tag();
const OFFICIAL = `test-topics-official-${T}`;
const MEDIA = `test-topics-media-${T}`;
const app = await buildApp();

before(async () => {
  await sql`INSERT INTO sources (id, name, kind, tier, participation_mode, first_party, next_fetch_at) VALUES
    (${OFFICIAL}, 'Official', 'rss', 'T1', 'editorial', true, '2100-01-01'),
    (${MEDIA}, 'Media', 'rss', 'T2', 'editorial', false, '2100-01-01')`;
});
after(async () => {
  await app.close();
  await stopBoss();
  await closeDb();
});

let n = 0;
interface Report {
  source?: string;
  at: Date;
  title: string;
  originalTitle?: string;
  subjects?: string[];
  tags?: string[];
  score?: number;
  selected?: boolean;
  fact?: number;
  category?: string;
}

/** A published report; `fact` links it to a fact before publishing, as grouping would. */
async function report(r: Report): Promise<string> {
  n += 1;
  const { articleId } = await upsertMaterial({
    sourceId: r.source ?? MEDIA, url: `https://example.com/topics-${T}-${n}`, title: r.originalTitle ?? r.title, bodyText: "body", bodyHtml: "<p>body</p>", bodyStatus: "ok", via: "fetch", publishedAt: r.at,
  });
  await sql`UPDATE articles SET discovered_at = ${r.at}, timeline_at = ${r.at}, grouped_at = now() WHERE id = ${articleId}`;
  await sql`INSERT INTO analyses (article_id, input_revision, origin, relevance, category, title_zh, summary_zh, score, selected, subjects, tags)
            VALUES (${articleId}, 1, 'rule', 'pass', ${r.category ?? "manufacturing"}, ${r.title}, ${`摘要 ${n}`}, ${r.score ?? 80}, ${r.selected ?? true}, ${r.subjects ?? []}, ${[r.category === "design-tools" ? "新品发布" : r.category === "design-tools" ? "研究/报告" : r.category === "industry" ? "教程/实践" : r.category === "industry" ? "并购/合作" : r.category === "industry" ? "观点/评论" : "新品发布", ...(r.tags ?? [])]})`;
  if (r.fact) await sql`INSERT INTO fact_articles (fact_id, article_id, role) VALUES (${r.fact}, ${articleId}, 'report')`;
  await publishArticle(articleId, { releasedAt: new Date(r.at.getTime() + 60_000) });
  return articleId;
}

async function story(title: string): Promise<{ id: number; publicId: string }> {
  const publicId = randomUUID();
  const [s] = await sql<{ id: number }[]>`INSERT INTO stories (public_id, title, first_report_at, latest_at) VALUES (${publicId}, ${title}, now(), now()) RETURNING id`;
  return { id: s!.id, publicId };
}

async function fact(storyId: number | null, title: string): Promise<number> {
  const [f] = await sql<{ id: number }[]>`INSERT INTO facts (public_id, story_id, title) VALUES (${`f-${T}-${randomUUID()}`}, ${storyId}, ${title}) RETURNING id`;
  return f!.id;
}

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600_000);
const ids = (items: Array<{ id: string }>) => items.map((i) => i.id);
const page = async (slug: string, p = 1) => {
  const data = await loadTopicPage(slug, p, new Date());
  assert.ok(data, `${slug} page ${p}`);
  return data;
};
/** Every article of a topic, over all its pages. */
async function members(slug: string): Promise<string[]> {
  const first = await page(slug);
  const out = ids(first.items);
  for (let p = 2; p <= first.pageCount; p++) out.push(...ids((await page(slug, p)).items));
  return out;
}

test("a company topic takes the articles about it, not the ones that only mention it", async () => {
  const about = await report({ at: hoursAgo(30), title: `台积电 N3 扩产计划 ${T}`, subjects: ["tsmc"] });
  const product = await report({ at: hoursAgo(31), title: `台积电上调资本支出 ${T}`, subjects: ["tsmc"] });
  const english = await report({ at: hoursAgo(32), title: `制程更新 ${T}`, originalTitle: `TSMC announces node ${T}`, subjects: ["tsmc", "nvidia"] });
  const subpoena = await report({ at: hoursAgo(33), title: `供应商向 NVIDIA 调整配额 ${T}`, subjects: ["nvidia", "tsmc"] });
  const lowerCase = await report({ at: hoursAgo(34), title: `nvidia 公布新的供应框架 ${T}`, subjects: ["nvidia", "intel"] });
  const pact = await report({ at: hoursAgo(35), title: `二十余家芯片公司签署协议 ${T}`, subjects: ["nvidia", "tsmc", "intel"] });
  const metadata = await report({ at: hoursAgo(36), title: `Metrology 标准发布，NVIDIA 参与 ${T}`, subjects: ["intel", "nvidia"] });
  const adjacent = await report({ at: hoursAgo(37), title: `发布三星的新存储 ${T}`, subjects: ["samsung", "nvidia"] });
  const headline = await report({ at: hoursAgo(38), title: `台积电被一篇盘点提到 ${T}`, subjects: ["intel"] });
  const hbm = await report({ at: hoursAgo(39), title: `HBM 产能扩张 ${T}`, tags: ["HBM"] });

  const tsmcList = await members("tsmc");
  for (const id of [about, product, english]) assert.ok(tsmcList.includes(id), "about TSMC");
  for (const id of [subpoena, lowerCase, pact, headline]) assert.ok(!tsmcList.includes(id), "only mentions TSMC");
  const nvidiaList = await members("nvidia");
  for (const id of [subpoena, lowerCase, metadata]) assert.ok(nvidiaList.includes(id), "about NVIDIA");
  for (const id of [english, pact]) assert.ok(!nvidiaList.includes(id), "only mentions NVIDIA");
  const samsungList = await members("samsung");
  assert.ok(samsungList.includes(adjacent), "Samsung next to Chinese text");
  assert.ok(!samsungList.includes(metadata), "Metrology is not Samsung");
  assert.ok((await members("memory")).includes(hbm), "a technical direction takes its tag");

  const topicsOf = async (id: string) => {
    const res = await app.inject({ method: "GET", url: `/api/site/items/${id}` });
    return (JSON.parse(res.body) as { topics: Array<{ slug: string }> }).topics.map((t) => t.slug);
  };
  assert.deepEqual(await topicsOf(about), ["tsmc", "releases"]);
  assert.deepEqual(await topicsOf(subpoena), ["nvidia", "releases"]);
  assert.deepEqual(await topicsOf(pact), ["releases"]);
  assert.deepEqual(await topicsOf(hbm), ["memory", "releases"]);
});

test("a story page names the topics of its reports", async () => {
  const launch = await story(`HBM 产能包发布 ${T}`);
  await report({ source: OFFICIAL, at: hoursAgo(26), title: `HBM 产能包发布 ${T}`, tags: ["HBM"], fact: await fact(launch.id, "发布 HBM 包") });
  assert.deepEqual(await topicsOfStory(launch.id), [{ slug: "memory", name: "存储" }, { slug: "releases", name: "新品发布" }]);
});

test("withdrawn articles stay out of lists and counts", async () => {
  const kept = await report({ at: hoursAgo(5), title: `美光发布新 DRAM ${T}`, subjects: ["micron"] });
  const withdrawn = await report({ at: hoursAgo(4), title: `美光撤回的消息 ${T}`, subjects: ["micron"] });
  await sql`UPDATE publications SET visibility = 'withdrawn' WHERE article_id = ${withdrawn}`;

  const data = await page("micron");
  assert.deepEqual(ids(data.items), [kept]);
  assert.equal(data.topic.total, 1);
  const summary = (await listTopicSummaries()).topics.find((t) => t.slug === "micron")!;
  assert.equal(summary.latest?.title, `美光发布新 DRAM ${T}`, "the index shows the newest public article");
});

test("every topic has a page; unknown topics and pages past the end have none", async () => {
  const empty = await page("avnet");
  assert.equal(empty.topic.indexable, false, "a topic without content is not indexed");
  assert.deepEqual(empty.items, []);
  assert.equal(await loadTopicPage("not-a-topic", 1, new Date()), null);
  assert.equal(await loadTopicPage("avnet", 2, new Date()), null);
  const index = await app.inject({ method: "GET", url: "/api/site/topics" });
  const body = JSON.parse(index.body) as { groups: Array<{ key: string }>; topics: Array<{ slug: string }> };
  assert.deepEqual(body.groups.map((g) => g.key), ["company", "segment", "genre"]);
  assert.deepEqual(body.topics.map((t) => t.slug).sort(), TOPICS.map((t) => t.slug).sort(), "the index lists every topic");
});
