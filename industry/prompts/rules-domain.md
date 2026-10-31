【元器件／电子分销翻译与术语规则 — 本站内容面向采购、FAE、分销与供应链读者，严格遵守】

1. 歧义默认值：以下词在中文有多义时，按本站语境处理：
   - Chip / chips = 芯片／器件（本站默认）
   - Agent = 保留英文或写「代理商」视语境；本站几乎不用「智能体」义
   - Token / tokens = 若非金融代币语境少见；出现时按上下文，勿默认成模型 token
   - Allocation / on allocation = 配额／分配（器件供货紧张时的分配供货）
   - Lead time / LT = 交期（可写「交期」或保留 LT）
   - Spot = 现货
   - Contract / contract price = 合约／合约价
   - Wafer = 晶圆
   - Fab / foundry = fab／晶圆厂（可写「fab」）
   - OSAT = OSAT／封测厂（可写「封测」）
   - Distributor = 分销商
   - EOL = EOL（停产）
   - NRND = NRND（不建议新设计）
   - MOQ = MOQ（最小订货量）
   - NCNR = NCNR（不可取消不可退货）
   - Datasheet = datasheet 或「数据手册」
   - MPN / P/N / part number = 保留原文料号，不翻译、不扩写
   - BOM = BOM／物料清单
   - ASIC / FPGA / MCU / SoC / PMIC = 保留英文缩写
   - Node / process node = 制程／制程节点（如 7nm、28nm 保留数字写法）

2. 以下专有名词一律保留官方写法，不翻译性扩写：
   - 料号与系列：任意 MPN、订货型号、封装后缀（如 LQFP、BGA、QFN）一字不改
   - 原厂（举例）：TI / Texas Instruments、ADI / Analog Devices、Infineon、ST / STMicroelectronics、NXP、Microchip、Renesas、onsemi、Rohm、Toshiba、Samsung、SK hynix、Micron、Kioxia、TSMC、UMC、GlobalFoundries、SMIC、ASE、Amkor、Amphenol、TE Connectivity、Molex、Yageo、Murata、TDK
   - 分销商（举例）：Arrow、Avnet、WPG（文晔）、Serial（世平）、Future、Digi-Key、Mouser、LCSC（立创）
   - 技术缩写：MPN、EOL、NRND、MOQ、NCNR、OSAT、HBM、DDR、LPDDR、NAND、SiC、GaN、PCIe、SerDes、BGA、QFN 等 2–6 字母行业缩写，默认保留英文
   - 通用技术：API、SDK、EDA、IP（半导体设计 IP）、PCB、SMT

3. 中国原厂／分销优先用官方中文名（首次出现可双标，后续保持一致）：
   - 台积电（TSMC）／联电（UMC）／中芯国际（SMIC）／长电科技／通富微电／华天
   - 文晔（WPG）／世平（Serial）／箭心／安富利（Avnet 中文场景）／立创（LCSC）
   - 韦尔／兆易创新／士兰微／斯达半导／时代电气 等按其官方中文名
   - 国际原厂在中文稿里可用常用简称：TI、ADI、意法半导体（ST）、英飞凌（Infineon）、恩智浦（NXP）

4. 代码／命令／URL／数字单位／料号一字不改保留：
   - 反引号代码 `code` 不翻译
   - URL 原样
   - 料号、封装、订货码原样（含连字符与大小写）
   - 数字+单位：26 weeks LT / 12-week lead time / $0.42 / 300mm wafer / 7nm / 1.2V / 85°C
   - 金额、交期周数、产能（kwpm／片／月）、涨跌幅必须保留原文阿拉伯数字和单位；不要改写成含糊的中文数量词
