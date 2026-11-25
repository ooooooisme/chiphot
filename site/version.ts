import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Semver from the repo VERSION file, without a leading v. */
export function packageVersion(): string {
  try {
    const raw = readFileSync(join(root, "VERSION"), "utf8").trim().replace(/^v/i, "");
    return raw || "dev";
  } catch {
    return "dev";
  }
}

/** Human-facing site version for footers (`v0.2.1`). */
export function displayVersion(): string {
  const v = packageVersion();
  return v === "dev" ? v : `v${v}`;
}

/** Value for /api/health `release` and worker heartbeat. */
export function releaseLabel(): string {
  const v = packageVersion();
  const extra = process.env.AIHOT_RELEASE?.trim();
  if (extra && extra !== "dev") {
    if (/^\d+\.\d+\.\d+/.test(extra)) return extra;
    if (v !== "dev") return `${v}+${extra.slice(0, 7)}`;
    return extra;
  }
  return v === "dev" ? extra || "dev" : v;
}