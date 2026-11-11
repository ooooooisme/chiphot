import { chromium } from "@playwright/test";
import { fakeApi, feedItem, itemDetail, startWebServer, visit, FIXTURE_AT as at } from "../apps/web/tests/web-server.ts";

const item = feedItem({ id: "item-0", title: "对齐测试标题", selected: true });
const api = fakeApi((url, res) => {
  if (url.pathname === "/api/site/items/item-0") {
    return itemDetail({
      ...item,
      summary: "导读",
      reason: "推荐理由",
      body: { zh: "<p>正文</p>", original: null, zhKind: "translation", complete: true },
    });
  }
});

const web = await startWebServer(api);
const browser = await chromium.launch({ channel: "chromium" });

async function measure(width) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  await visit(page, `${web.origin}/items/item-0`);
  await page.waitForTimeout(300);
  const data = await page.evaluate(() => {
    const vis = (el) => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    };
    const chevron = [...document.querySelectorAll(".src-article-back-chevron")].find(vis);
    const h1 = document.querySelector("h1[data-page-title]");
    const meta = document.querySelector("article span.font-semibold.text-ink-2");
    const rect = (el) => (el ? el.getBoundingClientRect() : null);
    const c = rect(chevron);
  const strokeLeft = c ? c.left + (c.width * 8) / 24 : null;
    return {
      chevron: c,
      chevronStrokeLeft: strokeLeft,
      h1: rect(h1),
      meta: meta ? rect(meta) : null,
    };
  });
  await page.close();
  return { width, ...data };
}

const m390 = await measure(390);
const m1440 = await measure(1440);
console.log(JSON.stringify({ m390, m1440 }, null, 2));

await browser.close();
await web.stop();
