import sharp from "sharp";

const files = [
  "home-1440.png",
  "home-390.png",
  "all-1440.png",
  "category-1440.png",
  "article-1440.png",
  "article-390.png",
];

function hex([r, g, b]) {
  return `#${[r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
}

async function sample(path, label, x, y) {
  const { data, info } = await sharp(path).raw().toBuffer({ resolveWithObject: true });
  const i = (y * info.width + x) * info.channels;
  const px = [data[i], data[i + 1], data[i + 2]];
  return { label, x, y, rgb: px, hex: hex(px) };
}

const base = "/opt/cursor/artifacts";
const picks = [
  { file: "home-1440.png", samples: [
    ["background (above fold)", 200, 120],
    ["ink (body text)", 700, 400],
    ["accent (wordmark 热)", 720, 55],
    ["accent (daily strip)", 720, 180],
    ["accent (category selected)", 380, 130],
  ]},
  { file: "article-1440.png", samples: [
    ["background", 100, 200],
    ["article title ink", 400, 280],
    ["accent link", 420, 350],
  ]},
];

for (const group of picks) {
  console.log(`\n${group.file}:`);
  for (const [label, x, y] of group.samples) {
    const r = await sample(`${base}/${group.file}`, label, x, y);
    console.log(`  ${label} @(${x},${y}): ${r.hex} rgb(${r.rgb.join(",")})`);
  }
}
