# ChipHOT architecture (overview)

ChipHOT runs on the **AIHOT engine**: a multi-process stack (API, worker, web) with shared backend logic, a single public read layer, and worker-only model calls. For engine internals, data flow, and migration rules, see the upstream-oriented guide [architecture.md](./architecture.md) in this folder.

## What ChipHOT customizes

| Layer | Location | Role |
|--------|-----------|------|
| Engine | `apps/`, `packages/` | Collection, scoring, grouping, reports, public API/RSS/MCP (fork inherits upstream; avoid drive-by engine changes in governance-only work) |
| Site | `site/` | Name, copy, models, brand, legal pages, public static assets |
| Industry | `industry/` | Taxonomy, topics, sources, prompts, selection thresholds |

ChipHOT is a **separate brand** from AIHOT: use ChipHOT naming and assets in `site/`, not AIHOT’s name or logo (see [NOTICE](../NOTICE)).

## Deployment (planned)

Production deployment for ChipHOT is planned for **Hong Kong** later. Until then, follow [deploy.md](./deploy.md) for local and generic hosting; fork-specific runbooks may be added when HK infra is fixed.

## Editorial and compliance red lines

Content and curation for ChipHOT must **not** include:

- Topics that are **legally sensitive** in the **United States** or **mainland China** (political, regulatory, or similar high-risk areas—when in doubt, exclude).
- Discussion framed around **countries or regions subject to U.S. sanctions or export controls** (e.g. embargoed or heavily restricted destinations under U.S. law).
- **Defense**, **military**, or **export-control** themed columns or recurring sections.

These lines apply to editorial direction in `industry/` and published output, not to renaming the upstream codebase.

## Related docs

- [customize.md](./customize.md) — re-targeting the site to another industry  
- [deploy.md](./deploy.md) — run and upgrade  
- [NOTICE](../NOTICE) — license and branding
