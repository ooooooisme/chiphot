import { chromium } from "@playwright/test";
import { join } from "node:path";
import { fakeApi, feedItem, itemDetail, startWebServer, visit, FIXTURE_AT as at } from "../apps/web/tests/web-server.ts";

const items = Array.from({ length: 12 }, (_, i) =>
  feedItem({ id: `item-${i}`, title: `供应链快讯 ${i + 1}：封装与交期`, selected: true }),
);

const api = fakeApi((url, res) => {
  const p = url.pathname;
  if (p === "/api/site/meta") return { changelogVersion: "fixture" };
  if (p === "/api/site/track") {
    res.statusCode = 204;
    return undefined;
  }
  if (p === "/api/site/timeline") {
    return {
      filters: { channel: "all", category: null, tag: null },
      cards: items.map((item) => ({ key: item.id, anchorAt: at, item, group: null })),
      nextCursor: null,
      hot: null,
      dayCounts: { "2026-10-04": items.length },
    };
  }
  if (p === "/api/site/reports/daily/latest-page") {
    return {
      report: { kind: "daily", key: "2026-10-04", issueNumber: 1, title: "元器件", generatedAt: at },
      index: [{ key: "2026-10-04", issueNumber: 1, title: "元器件", count: 3 }],
    };
  }
  if (p === "/api/site/items/item-0") {
    return itemDetail({
      id: "item-0",
      title: items[0].title,
      selected: true,
      summary: "这条报道概述了封装产能与交期变化，便于读者快速把握要点。",
      reason: "多家分销渠道同时上调交期，且与原厂公开表态一致，值得上精选。",
      body: { zh: "<p>正文段落</p>", original: null, zhKind: "translation", complete: true },
    });
  }
});

const shots = [
  ["home", "/"],
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
