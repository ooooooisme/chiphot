// ChipHOT 精选门槛。五维加权、九类 ITEM_TYPES 权重与品味规则在 prompts/selection-score.md；这里只定“多少分算入选”（无「明确 AI」类门槛）。
// 流水线：prefilter 非 BLOCK → 两次 selection-score（各 0–100）→ 两次之和 ≥ 2×门槛 → analyses.selected；
// 公开精选还需 selection_candidate、归组完成且 selection_adds_value≠false（见 docs/selection.md）。
// 门槛按信源分级：T1 原厂／官网 · T1_5 官方账号 · T2 媒体与个人。改提示词或数字后应用 scripts/eval-selection.ts 在标注样本上复测。

export const SELECTION = {
  /**
   * 信源分级 → 入选门槛（**两次评分的平均分**须达到；两次之和须 ≥ 2×该值）。
   * T1 例：台积电／Intel 官网；T1_5 例：原厂社交账号；T2 例：EE Times、行业媒体。
   * EXCLUDE_MP 及未列出的分级不参与精选评分。
   */
  thresholds: { T1: 60, T1_5: 65, T2: 76 } as Record<string, number>,
  /**
   * 未入选但平均分高于此值的资料，仍走内容理解（中文标题、摘要、推荐理由）；其余走标题摘要翻译。
   * 测板若长期精选为 0，先查 prefilter BLOCK、双次 score 是否过线，再看归组 selection_adds_value。
   */
  understandFloor: 50,
} as const;
