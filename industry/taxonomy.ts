// ChipHOT 分类体系：类别 key 与 ITEM_TYPES 与人话枚举对齐，上线后勿改 key。

/**
 * 网页类别（筛选、RSS、URL ?category=…）。`industry` 为产业与市场，也是无归类时的兜底节（见 edition.ts）。
 */
export const CATEGORIES = [
  { key: "manufacturing", tagColor: "indigo", label: "制造", feedLabel: "制造／晶圆", section: "制造／晶圆", guide: "晶圆制造、制程节点、产能与扩产／减产、建厂、设备进厂、良率与工厂运营；设备商整机发布若无设计工具属性可归产业与市场。" },
  { key: "packaging", tagColor: "turquoise", label: "封装", feedLabel: "先进封装", section: "先进封装", guide: "CoWoS、2.5D/3D、Chiplet、OSAT 封测产能、封装材料与工艺导入；仅单颗成品规格且无封装维度可归存储或设计工具。" },
  { key: "memory", tagColor: "violet", label: "存储", feedLabel: "存储", section: "存储", guide: "DRAM、NAND、HBM 与模组、存储价格／合约／供需；消费级促销稿若无链上实质归产业与市场。" },
  { key: "design-tools", tagColor: "blue", label: "设计", feedLabel: "设计工具", section: "设计工具", guide: "EDA、IP 核、仿真、PCB/DFT、Sign-off 与设计流程；纯研究论文可归产业与市场或仍归设计工具若主体是方法学。" },
  { key: "industry", tagColor: "orange", label: "市场", feedLabel: "产业与市场", section: "产业与市场", guide: "分销、交期、渠道、库存、价格、并购、财报、人事、合作、贸易与非军工政策；教程／观点／评论类若无更贴切栏目可归本类。" },
] as const satisfies ReadonlyArray<{ key: string; tagColor: string; label: string; feedLabel?: string; section: string; guide: string; commentary?: true }>;

export const RELEASE: { category: string; tag: string; unit: string } | null = null;

export const PLAIN_TERMS: readonly string[] = ["chip", "fab", "eda", "hbm", "dram", "nand", "soc", "fpga", "mcu", "gpu", "ceo", "ipo", "tsmc"];

/** 与 prompts/content-understanding.md、selection-score.md 一致。 */
export const ITEM_TYPES = [
  "fab_or_capacity",
  "packaging_assembly",
  "memory_product",
  "design_tool_or_ip",
  "distribution_supply",
  "product_launch",
  "industry_event",
  "opinion_analysis",
  "tutorial_explainer",
] as const;

export const CATEGORY_TAGS = [
  "产能/扩产", "新品发布", "技术突破", "并购/合作", "财报/业绩", "分销/渠道", "价格/供需", "政策/贸易", "产线/设备", "研究/报告", "观点/评论", "教程/实践", "其他",
] as const;

export const TOPIC_TAGS = [
  "晶圆产能", "先进制程", "HBM", "DRAM", "NAND", "先进封装", "Chiplet", "EDA", "IP核", "汽车芯片", "代工", "分销渠道", "供需/价格", "供应链", "MCU", "模拟芯片",
] as const;

export const ENTITY_TAGS = ["TSMC", "Samsung", "Intel", "Micron", "SK hynix", "NVIDIA", "AMD", "Qualcomm", "ASML", "Arrow", "Avnet"] as const;

export const TAG_SYNONYMS: Readonly<Record<string, string>> = {
  产能: "产能/扩产", 扩产: "产能/扩产", 制程: "先进制程", 封装: "先进封装",
  并购: "并购/合作", 收购: "并购/合作", 合作: "并购/合作", 融资: "并购/合作",
  财报: "财报/业绩", 业绩: "财报/业绩", 营收: "财报/业绩",
  分销: "分销/渠道", 渠道: "分销/渠道", 备货: "分销/渠道", 代理商: "分销/渠道",
  价格: "价格/供需", 供需: "价格/供需", 交期: "价格/供需", 库存: "价格/供需",
  政策: "政策/贸易", 贸易: "政策/贸易", 关税: "政策/贸易", 制裁: "政策/贸易",
  设备: "产线/设备", 产线: "产线/设备",
  论文: "研究/报告", 研究: "研究/报告", 报告: "研究/报告",
  观点: "观点/评论", 评论: "观点/评论", 分析: "观点/评论",
  教程: "教程/实践", 实践: "教程/实践", 指南: "教程/实践",
  发布: "新品发布", 新品: "新品发布", 产品: "新品发布",
  行业: "并购/合作", 动态: "并购/合作",
};

export const ENTITIES: Record<string, { name: string; displayTag: string | null; aliases: string[]; orgNames?: string[]; otherNames?: string[] }> = {
  tsmc: { name: "TSMC 台积电", displayTag: "TSMC", aliases: ["TSMC", "台积电", "Taiwan Semiconductor"], orgNames: ["TSMC", "台积电"] },
  samsung: { name: "Samsung 三星", displayTag: "Samsung", aliases: ["Samsung", "三星", "Samsung Electronics"], orgNames: ["Samsung", "三星电子"] },
  intel: { name: "Intel", displayTag: "Intel", aliases: ["Intel", "英特尔"], orgNames: ["Intel", "英特尔"] },
  micron: { name: "Micron 美光", displayTag: null, aliases: ["Micron", "美光"], orgNames: ["Micron", "美光"] },
  "sk-hynix": { name: "SK hynix", displayTag: null, aliases: ["SK hynix", "SK海力士", "海力士"], orgNames: ["SK hynix", "SK海力士"] },
  nvidia: { name: "NVIDIA", displayTag: null, aliases: ["NVIDIA", "英伟达"], orgNames: ["NVIDIA", "英伟达"] },
  amd: { name: "AMD", displayTag: null, aliases: ["AMD", "Advanced Micro Devices"], orgNames: ["AMD"] },
  qualcomm: { name: "Qualcomm 高通", displayTag: null, aliases: ["Qualcomm", "高通"], orgNames: ["Qualcomm", "高通"] },
  asml: { name: "ASML", displayTag: "ASML", aliases: ["ASML"], orgNames: ["ASML"] },
  arrow: { name: "Arrow 艾睿", displayTag: null, aliases: ["Arrow", "Arrow Electronics", "艾睿"], orgNames: ["Arrow", "艾睿"] },
  avnet: { name: "Avnet 安富利", displayTag: null, aliases: ["Avnet", "安富利"], orgNames: ["Avnet", "安富利"] },
};

export const IDENTITY_LEXICON: ReadonlyArray<{ id: string; name: string; patterns: RegExp[] }> = [
  { id: "tsmc", name: "TSMC", patterns: [/tsmc|台积电|taiwan\s+semiconductor/i] },
  { id: "samsung", name: "Samsung", patterns: [/samsung|三星/i] },
  { id: "intel", name: "Intel", patterns: [/\bintel\b|英特尔/i] },
  { id: "micron", name: "Micron", patterns: [/micron|美光/i] },
  { id: "sk-hynix", name: "SK hynix", patterns: [/sk\s*hynix|海力士/i] },
  { id: "nvidia", name: "NVIDIA", patterns: [/nvidia|英伟达|\bcuda\b/i] },
  { id: "amd", name: "AMD", patterns: [/\bamd\b|advanced micro devices/i] },
  { id: "qualcomm", name: "Qualcomm", patterns: [/qualcomm|高通|\bsnapdragon\b/i] },
  { id: "asml", name: "ASML", patterns: [/\basml\b/i] },
  { id: "arrow", name: "Arrow", patterns: [/arrow\s+electronics|\barrow\b/i] },
  { id: "avnet", name: "Avnet", patterns: [/avnet|安富利/i] },
];

export const PUBLISHER_DOMAINS: ReadonlyArray<{ entityId: string; domains: readonly string[] }> = [
  { entityId: "tsmc", domains: ["tsmc.com"] },
  { entityId: "intel", domains: ["intel.com"] },
  { entityId: "nvidia", domains: ["nvidia.com"] },
  { entityId: "amd", domains: ["amd.com"] },
  { entityId: "qualcomm", domains: ["qualcomm.com"] },
  { entityId: "asml", domains: ["asml.com"] },
  { entityId: "micron", domains: ["micron.com"] },
  { entityId: "arrow", domains: ["arrow.com"] },
  { entityId: "avnet", domains: ["avnet.com"] },
];

export const IDENTITY_CONTEXT_ALIASES: ReadonlyArray<{ entityId: string; pattern: RegExp }> = [];
