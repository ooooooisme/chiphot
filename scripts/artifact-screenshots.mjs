import { chromium } from "@playwright/test";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fakeApi, feedItem, itemDetail, startWebServer, visit, FIXTURE_AT as at } from "../apps/web/tests/web-server.ts";

const items = Array.from({ length: 12 }, (_, i) =>
  feedItem({ id: `item-${i}`, title: `供应链快讯 ${i + 1}：封装与交期` }),
);

const api = fakeApi((url, res) => {
  const p = url.pathname;
  if (p === "/api/site/meta") return { changelogVersion: "fixture" };
  if (p === "/api/site/track") {
    res.statusCode = 204;
    return undefined;
  }
  if (p === "/api/site/timeline") {
    const category = url.searchParams.get("category");
    const cards = items.map((item, i) => ({
      key: item.id,
      anchorAt: at,
      item: category && i > 0 ? { ...item, title: `制造类 · ${item.title}` } : item,
      group: null,
    }));
    return {
      filters: { channel: "all", category, tag: null },
      cards,
      nextCursor: null,
      hot: null,
      dayCounts: { "2026-10-04": cards.length },
    };
  }
  if (p === "/api/site/pool") {
    const page = Number(url.searchParams.get("page") || 1);
    return {
      filters: { channel: "all", category: url.searchParams.get("category"), tag: null, q: null, tab: "time" },
      items: items.map((item, i) => ({ ...item, title: `全部 · ${item.title}` })),
      page,
      pageCount: 1,
      total: items.length,
      todayCount: items.length,
      freshness: at,
    };
  }
  if (p === "/api/site/reports/daily/latest-page") {
    return {
      report: { kind: "daily", key: "2026-10-04", issueNumber: 1, title: "元器件供应链", generatedAt: at },
      index: [{ key: "2026-10-04", issueNumber: 1, title: "元器件供应链", count: 3 }],
    };
  }
  const itemMatch = p.match(/^\/api\/site\/items\/(item-\d+)$/);
  if (itemMatch) {
    const id = itemMatch[1];
    const base = items.find((it) => it.id === id) ?? items[0];
    return itemDetail({ id, title: base.title, body: { zh: "<p>正文：热芯网演示文章，含真实链接 <a href=\"https://example.org\">原文</a>。</p>", original: null, zhKind: "translation", complete: true } });
  }
});

const shots = [
  ["home", "/"],
  ["all", "/all"],
  ["category", "/all?category=manufacturing"],
  ["article", "/items/item-0"],
];
const sizes = [
  [1440, 900],
  [390, 844],
];

const outDir = "/opt/cursor/artifacts";
const web = await startWebServer(api);
const browser = await chromium.launch({ channel: "chromium" });

try {
  for (const [name, path] of shots) {
    for (const [width, height] of sizes) {
      const page = await browser.newPage({ viewport: { width, height } });
      await visit(page, `${web.origin}${path}`);
      await page.waitForTimeout(400);
      const file = join(outDir, `${name}-${width}.png`);
      await page.screenshot({ path: file, fullPage: true });
      await page.close();
      console.log("wrote", file);
    }
  }
} finally {
  await browser.close();
  await web.stop();
}
