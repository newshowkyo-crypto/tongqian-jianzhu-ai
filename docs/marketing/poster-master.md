# 同乾方略 · 宣传海报 Premium Prompt v2

> 配套同乾方略 logo（深蓝底 + 8 道银色螺旋 + 古铜玫瑰金方孔铜钱罗盘）的视觉系统。
> 与图册 [`brochure-deck.md`](./brochure-deck.md) 共享 BASE STYLE v2，确保印刷品视觉一致。
>
> 公司：**湖北省同乾咨询有限公司**　|　网站：**www.tongqian.io**　|　地址：中国 · 武汉
>
> **审美锚定**：故宫文创 / 苏富比拍卖图录 / 中国银行年报 / Pentagram brand book / Berkshire Hathaway 股东信
> **绝不像**：淘宝 / Stripe Dashboard / Linear / Notion / 硅谷 SaaS

---

## 🎨 Visual System v2（与图册同源）

```
主背景：    Deep Imperial Navy   #0f1d3a   (故宫夜空 / 中国银行深蓝)
深背景：    Midnight Ink         #050a18   (深空 / 烫黑)
古铜玫瑰金：Antique Bronze       #b87a55   (logo 中心铜钱色 / 主点缀)
古铜暖光：  Warm Copper          #c89070   (铜钱反光高光)
抛光银：    Brushed Platinum     #c8ccd4   (logo 螺旋臂主色)
冷银高光：  Cool Pearl           #e8ebf0   (银色边缘反光)
象牙暖白：  Ivory Cream          #f0e7d4   (高级宣纸色)
水墨黑：    Ink Black            #1a1a1a   (正文)

❌ 绝不用：
- #1e5fbf（太互联网）
- #d4953a（太俗气）
- 纯白（用象牙白 #f0e7d4）
- 任何饱和色
```

### 共用 BASE STYLE v2 token（每张海报复用）

```
[BASE STYLE v2]
Premium corporate poster for "Hubei Tongqian Consulting Co., Ltd. 
湖北省同乾咨询有限公司", inspired by Forbidden City museum publications, 
Sotheby's auction catalogs, China Merchants Bank annual reports, 
Pentagram studio brand book aesthetic.

Color palette ONLY (extracted from company logo):
- Deep imperial navy #0f1d3a (primary background)
- Midnight ink #050a18 (deep contrast)
- Antique bronze rose-gold #b87a55 (primary accent)
- Warm copper #c89070 (highlights)
- Brushed platinum silver #c8ccd4 (secondary metallic)
- Cool pearl #e8ebf0 (silver highlights)
- Ivory cream #f0e7d4 (warm white text)
- Ink black #1a1a1a (body text)

Typography: 
- Chinese: Source Han Serif Light (思源宋体 Light) for titles, 
  Source Han Serif Regular for body. Strictly simplified Chinese.
- English: GT Sectra Display for titles, Söhne Breit Light for body, 
  all caps with letter-spacing +25% for small labels.
- NEVER use sans-serif Helvetica / Inter / SF Pro for titles.
- NEVER use bold weights heavier than Medium — premium = restraint.

Layout: 
- Generous negative space ≥ 50% empty
- Maximum 3 main content blocks per page
- Swiss 12-column grid
- Subtle 0.5px metallic hairline dividers
- Embossed gold foil texture on key titles
- Uncoated heavyweight cardstock paper feel (300 GSM)
- Subtle film grain 5%, micro paper texture

Composition Style:
- One single hero focus per page
- Editorial magazine pacing
- Like a museum exhibition catalog
- Not infographic, not dashboard, not powerpoint

Forbidden:
- Saturated #1e5fbf blue, bright #d4953a yellow
- Multiple icons, KPI dashboards, isometric 3D
- Gradient backgrounds, neon, glitter, sparkles
- Cartoon characters, photorealistic faces, stock photos
- Sans-serif title fonts, bold display fonts, condensed type
- E-commerce style, taobao colors, flash sale aesthetic
- Garbled chinese, traditional chinese, japanese kanji
- Saas dashboard style, silicon valley tech-startup feel
```



---

## 📋 三个方向总览

| 方向 | 气质关键词 | 适用场景 | 推荐张数 |
|---|---|---|---|
| **A. 拍卖图录派**（Sotheby's Catalogue）| 收藏级 / 印章感 / 古今对话 | 高端宣讲 / 投资人路演 / 行业峰会展位 | ★★★★★ |
| **B. 私人银行派**（Private Banking）| 信托质感 / 数据冷静 / 财务文件感 | 政企客户 / 央国企对接 / 银行场合 | ★★★★ |
| **C. 文化典藏派**（Cultural Heritage）| 易经哲学 / 山水构图 / 老字号味 | 创始人 IP 内容 / 公众号头图 / 长期品牌资产 | ★★★★★ |

每个方向给一份完整可即用 prompt，可独立投放。也可以同一活动印 3 张组合套，气质统一档次互补。



---

## 🏛 方向 A · 拍卖图录派（Sotheby's Catalogue）

> 适合：商务峰会展位、投资人见面会、行业大会主背板。
> 视觉重心：logo 大占比 + 极致留白 + 金属质感印章。
> 阅读节奏：3 秒抓住注意 → 30 秒读完核心信息。

### 中文必出文字（强制简体方正）

```
同乾方略
建筑产业的智能经营管家
让中小型建筑企业老板每天用 30 分钟搞定一周的决策
经营机会雷达 投标标书工厂 资质智能管家 合同风险审查
诚邀建筑业智能管家合伙人加盟
免保证金加盟 实名审核即可上岗 首年分润 30%
湖北省同乾咨询有限公司
中国 武汉
www.tongqian.io
```

### Prompt（推荐 Midjourney v7，喂 logo 作 reference）

```
Premium corporate poster for "Tongqian Fanglue 同乾方略", 
27cm × 40cm vertical (B2 size), 300dpi.

FULL FRAME composition:
A deep imperial navy #0f1d3a background, with extremely subtle 
embossed paper texture and 5% film grain, micro letterpress feel.

UPPER 32% — vertically centered hero zone:
The company logo placed prominently — circular medallion combining:
- 8 silver brushed-platinum spiral blades arranged radially (像罗盘指针)
- Center: an古铜玫瑰金 ancient Chinese square-hole coin (古钱币方孔)
  in warm copper #b87a55, embossed metallic relief
- Two small platinum dots offset (top-left and bottom-right) — orbital satellites
- Logo diameter 320px in design, dramatic metallic light reflection from top-left
- Deep drop shadow on midnight velvet, like a brushed-metal seal

Above logo, tiny ivory cream caps text 11pt, letter-spacing +35%, centered:
"PRIVATE & CONFIDENTIAL  ·  VOLUME 01  ·  2026"

Below logo, vertical spacing 64px:
Massive Chinese title 168pt Source Han Serif Light, ivory cream #f0e7d4, 
weight thin, letter-spacing +8%, centered:
"同乾方略"

Below title, hairline antique bronze divider 0.5px, 280px wide, centered.

Sub-title 30pt Source Han Serif Light, cool pearl #c8ccd4, 
letter-spacing +6%, centered:
"建筑产业的智能经营管家"

Tiny English caps 12pt antique bronze 70% opacity, letter-spacing +30%, centered:
"CONSTRUCTION INTELLIGENCE  ·  SINCE 2026"

CENTER 30% — single hero quote zone:
Vertically centered single line in warm copper #c89070, 
italic-style serif 22pt, letter-spacing +4%, centered:
"让中小型建筑公司的老板"
"每天用 30 分钟  ·  搞定一周的决策"

Above and below this quote, hairline copper dividers 0.5px, 200px wide.

LOWER MIDDLE 18% — 4-column capability strip:
4 equal columns separated by 0.5px platinum vertical hairlines.
Each column structure (top to bottom):
- Tiny copper number caps 10pt: "01" / "02" / "03" / "04"
- Chinese label 14pt ivory cream regular, centered:
  "经营机会雷达" / "投标标书工厂" / "资质智能管家" / "合同风险审查"
- English caps 9pt cool pearl 60%, letter-spacing +25%, centered:
  "OPPORTUNITY RADAR" / "TENDER FACTORY" / "QUALIFICATION GUARD" / "CONTRACT REVIEW"

LOWER 12% — solid antique bronze #b87a55 strip:
Centered ivory cream Chinese 16pt italic-style:
"诚邀建筑业智能管家合伙人加盟  ·  免保证金  ·  首年分润 30%"
Below caps 10pt cool pearl 70%, letter-spacing +25%:
"AGENT PARTNERSHIP PROGRAM  ·  AGENTS@TONGQIAN.IO"

VERY BOTTOM 8% — back to deep navy:
Three lines of micro-text, all caps, antique bronze 50% opacity, 
letter-spacing +30%, 10pt, centered:
Line 1: "湖北省同乾咨询有限公司"
Line 2: "HUBEI TONGQIAN CONSULTING CO., LTD."
Line 3: "WUHAN  ·  CHINA  ·  WWW.TONGQIAN.IO"

VISUAL FEEL:
Like the cover of a Sotheby's auction catalog, or the front page of 
a private bank annual report. The logo is the "exhibit hero", 
text is the "label plaque". Quietly expensive. Heavy. Sophisticated.
Reading rhythm: 3-second grab → 30-second core info → linger on bronze CTA.

[BASE STYLE v2]
NEGATIVE: 
infographic, dashboard, isometric 3D, illustration of buildings, 
photo of people, stock imagery, gradient background, neon, glitter,
sans-serif display title, helvetica, inter, bold heavy fonts,
multiple visual elements, cluttered composition, decorative ornaments,
chinese garbled characters, traditional chinese, japanese kanji,
saturated bright blue, yellow gold, e-commerce, taobao,
modern startup tech aesthetic, silicon valley style,
QR code on hero zone, website URL as main visual,
"call now" buttons, urgency badges
```



---

## 🏦 方向 B · 私人银行派（Private Banking Document）

> 适合：政企客户洽谈、央国企对接、银行场合、严肃商务封面。
> 视觉重心：信托级冷静 + 数据排版 + 财务文件审计感。
> 阅读节奏：稳健权威感先于功能介绍。

### 中文必出文字

```
同乾方略
专为中国中小型建筑企业打造的智能经营操作系统
五大核心能力
经营机会雷达 投标标书工厂 资质智能管家 合同风险审查 经营成本工具集
合规为本 数据本地化 全链路审计
覆盖 90% 老板日常经营决策
湖北省同乾咨询有限公司
中国 武汉
www.tongqian.io
PRIVATE AND CONFIDENTIAL
```

### Prompt

```
Editorial private-banking-document style poster, 
40cm × 60cm vertical (B1 size), 300dpi.

FULL FRAME: ivory cream paper #f0e7d4, heavy uncoated 350 GSM stock,
visible micro paper texture, subtle deckle-edge feel on left margin.

TOP 14% — solid imperial navy #0f1d3a band:
Far left edge: vertical antique bronze hairline 0.5px running floor to ceiling.
Centered Chinese title 64pt Source Han Serif Light, ivory cream:
"同乾方略"
Below 14pt copper caps letter-spacing +30%:
"TONGQIAN FANGLUE  ·  CONSTRUCTION INTELLIGENCE OS"
Top right corner micro caps 10pt cool pearl 70%:
"DOCUMENT 01-2026  ·  PRIVATE & CONFIDENTIAL"

UPPER MIDDLE 22% — clean text zone on ivory cream:
Generous left margin (24mm grid).
Section heading 12pt antique bronze caps letter-spacing +30%:
"OVERVIEW"
Below, single elegant Chinese paragraph in ink black, 
Source Han Serif Light 22pt, line-height 1.8x, justified left, max-width 70%:
"专为中国中小型建筑企业打造的"
"智能经营操作系统"
Below, smaller 14pt warm gray italic-style:
"An intelligent operating system designed for China's 
mid-sized construction enterprises."

CENTER 30% — five-column capability table:
Section heading 12pt antique bronze caps letter-spacing +30%:
"FIVE CORE CAPABILITIES  ·  五 大 核 心 能 力"

Below, 5 equal columns separated by 0.5px copper vertical hairlines.
Each column structure (no boxes, just structured space):
- Top: large 大写 Chinese ordinal "壹/贰/叁/肆/伍" 
  in antique bronze #b87a55, Source Han Serif thin, 56pt, centered.
- Middle: Chinese title 16pt ink black regular, centered:
  "经营机会雷达" / "投标标书工厂" / "资质智能管家" / 
  "合同风险审查" / "经营成本工具集"
- Bottom: English caps 9pt warm gray, letter-spacing +25%, centered:
  "OPPORTUNITY RADAR" / "TENDER FACTORY" / "QUALIFICATION GUARD" / 
  "CONTRACT REVIEW" / "OPERATIONS TOOLKIT"

Bottom of this zone, single 0.5px antique bronze hairline full width.

LOWER MIDDLE 16% — three-pillar trust statement:
3 equal columns, separated by 0.5px platinum hairlines.
Each column:
- Top: antique bronze caps heading 11pt letter-spacing +25%:
  "COMPLIANCE" / "DATA LOCALITY" / "AUDIT TRAIL"
- Below: Chinese 14pt ink black regular, centered:
  "合规为本" / "数据本地化存储" / "全链路审计日志"
- Below: warm gray 10pt italic-style:
  "PIPL · GB/T 35273" / "中国境内" / "保留 6 年"

Bottom of this zone, hairline copper divider 0.5px full width.

LOWER 12% — single-line headline statement:
Centered, in warm copper #c89070, italic-style serif 24pt, 
letter-spacing +4%:
"覆盖 90% 老板日常经营决策"
Below, smaller 12pt cool pearl darker, italic:
"Covering 90% of daily strategic decisions for construction CEOs."

VERY BOTTOM 6% — solid antique bronze #b87a55 strip:
Three lines of caps text, ivory cream, letter-spacing +30%, 
10pt, centered:
"湖北省同乾咨询有限公司  ·  HUBEI TONGQIAN CONSULTING CO., LTD."
"WUHAN  ·  CHINA  ·  WWW.TONGQIAN.IO"
"© 2026  ·  ALL RIGHTS RESERVED"

In the upper-right corner of the very bottom strip:
Tiny mini-version of the company logo medallion, 28px diameter, 
embossed feel — like a watermark seal on a financial certificate.

VISUAL FEEL:
Like the front page of a Goldman Sachs IPO prospectus, 
or a Berkshire Hathaway annual letter, or a Bank of China private 
wealth document. Trust above all. Cold restraint. Audit-grade typography.
The viewer should feel "this is a serious institution", not "this is a startup".

[BASE STYLE v2]
NEGATIVE:
photos of skyscrapers, business handshake, smiling consultants,
3D building rendering, charts with bars and pie graphs,
gradient background, neon highlights, animated effects,
emoji, sans-serif title, bold heavy fonts, condensed type,
saturated colors, pastel colors, gen-z aesthetics,
"trusted by 1000+ companies" social proof banners
```



---

## 🏯 方向 C · 文化典藏派（Cultural Heritage / Dynasty Brand）

> 适合：创始人 IP 内容、公众号封面、品牌长期资产、印刷折页内页、文化场合（如政府接见 / 产业园开幕）。
> 视觉重心：易经"乾"字 + 山水构图 + 老字号味道。
> 阅读节奏：先被文化氛围打动，再被信息说服。

### 中文必出文字

```
同乾
取自易经 乾卦
天行健 君子以自强不息
同乾方略
建筑产业的智能经营管家
以乾卦的稳健 同心的协力
陪伴中国 5400 万建筑业从业者
走过经营路上的每一个周期
湖北省同乾咨询有限公司
中国 武汉
www.tongqian.io
```

### Prompt

```
Premium cultural heritage style poster, blending I-Ching philosophy 
with modern minimalism, 27cm × 40cm vertical, 300dpi.

FULL FRAME: deep imperial navy #0f1d3a background with rich uncoated 
paper texture and 5% film grain, subtle vignette darkening at corners,
giving a velvet-on-bronze feel.

UPPER 38% — single hero character zone:
At horizontal center, vertically centered at 25% from top:
A massive ancient Chinese character "乾" (qián, the trigram of Heaven 
from I-Ching), in antique bronze #b87a55, weight thin Source Han Serif, 
360pt, with deeply embossed metallic relief — like an oxidized bronze 
artifact from Shang dynasty (商代青铜器). The character should feel 
historical, carved-from-bronze, NOT modern flat design. Subtle metallic 
light reflection from top-left, casting depth on midnight navy.

Above the character, tiny ivory cream caps 11pt, letter-spacing +35%, centered:
"FROM I-CHING  ·  HEXAGRAM ONE  ·  HEAVEN"

Below the character, hairline antique bronze divider 0.5px, 200px wide.

UPPER MIDDLE 14% — philosophy text zone:
Single Chinese line in cool pearl #c8ccd4, Source Han Serif Light, 
24pt italic-style, centered, letter-spacing +6%:
"取自《易经》· 乾卦"
Below, in ivory cream, 32pt regular, letter-spacing +4%:
"天行健  ·  君子以自强不息"
Below, 13pt antique bronze 70% opacity, italic:
"The way of Heaven is dynamic. The wise pursue strength without ceasing."

CENTER 18% — brand transition zone:
Single bold horizontal line of text, in ivory cream, 
Source Han Serif Light, 56pt, letter-spacing +8%, centered:
"同乾方略"
Below, hairline antique bronze divider 0.5px, 240px wide.
Below, 22pt cool pearl regular, centered:
"建筑产业的智能经营管家"
Below, 11pt copper caps letter-spacing +30%:
"CONSTRUCTION INTELLIGENCE  ·  STRATEGIC ADVISORY"

LOWER MIDDLE 18% — covenant text zone:
3 stacked Chinese lines, ivory cream 18pt Source Han Serif Light, 
line-height 2.2x, centered:
"以乾卦的稳健  ·  同心的协力"
"陪伴中国 5,400 万建筑业从业者"
"走过经营路上的每一个周期"

Below this block, a centered antique bronze hairline 0.5px, 320px wide.

LOWER 8% — single coin watermark:
Centered, a small embossed古钱币方孔 ancient coin (the brand's mark), 
diameter 60px, antique bronze with platinum highlight, 
NOT a logo replica but a "standalone coin" — like a sealed certificate 
authentication mark.

VERY BOTTOM 8%:
Three lines of micro-text, all caps, antique bronze 60% opacity, 
letter-spacing +30%, 10pt, centered:
Line 1: "湖北省同乾咨询有限公司"
Line 2: "HUBEI TONGQIAN CONSULTING CO., LTD."
Line 3: "WUHAN  ·  CHINA  ·  WWW.TONGQIAN.IO"

Very subtle background ornament (≤ 5% opacity, almost invisible):
Faint宋画 Song-dynasty mountain silhouettes (远山 distant peaks) 
behind the "乾" character, hinting at "天行健"  philosophical landscape, 
like a watermark — must NOT compete with the character, must be 
barely-perceivable poetic depth only.

VISUAL FEEL:
Like opening a Forbidden City exhibition catalog dedicated to the 
I-Ching, or a Confucian scholar's private journal cover. Cultural depth.
Quiet authority that comes from 5000-year heritage, not from VC funding.
The "乾" character is the soul of the brand, made tangible.

[BASE STYLE v2]
NEGATIVE:
modern font for "乾" character, flat design, sans-serif font for chinese,
cartoon ancient warrior, dragon illustrations, lotus flowers,
photo of Forbidden City buildings, real mountain photography,
calligraphy brush stroke effects (笔触), ink splash decorations,
oriental cliche red lanterns, paper cuts, qipao patterns,
festival imagery, Chinese New Year style,
multiple Chinese characters competing with "乾",
people, faces, hands, body parts
```



---

## 📐 三方向使用建议

### 单选 / 组合策略

| 场景 | 推荐方向 | 原因 |
|---|---|---|
| 行业峰会 / 大会展位主背板 | A 拍卖图录派 | 远看也精致，logo 占比大 |
| 政企客户专访 / 投标 / 央国企 | B 私人银行派 | 最商务最权威，不浮夸 |
| 公众号头图 / 创始人 IP 文章 | C 文化典藏派 | 内容力强 + 易传播 |
| 三联画并排展示（最高规格）| A + B + C | 一组三张，气质递进 |
| 印刷折页内页插图 | C 单独 | 文化感作为情感记忆点 |

### 推荐生成工具（每方向最佳匹配）

| 方向 | 首选工具 | 备选 |
|---|---|---|
| A 拍卖图录 | **Midjourney v7**（金属质感最强）+ logo cref | Flux 1.1 Pro Ultra |
| B 私人银行 | **GPT Image 2 / DALL·E 4**（中文最准 + 表格排版强）| MJ v7 |
| C 文化典藏 | **Midjourney v7**（"乾"字氛围感 + 山水暗景）| Flux Pro |

### 印刷工艺建议（最高规格）

```
方向 A（拍卖图录派）：
- 纸张：300 GSM 米色棉纸 / 凯撒手工纸
- 主标题"同乾方略"：烫金 (Pantone 871 C 古铜金) + 压凸 0.3mm
- logo：烫银 (Pantone 877 C) + 局部烫金
- 整体表面：哑光 UV / 无 UV（保留纸感）
- 装裱：木框装 / 卷轴装（现场展示）

方向 B（私人银行派）：
- 纸张：300 GSM 哑光铜版 / 凯撒高白
- 标题"同乾方略"：烫古铜金
- 内文：常规 K100 黑印
- 表面：哑光膜（防指纹）
- 装裱：硬纸板 + 哑膜对折装订（像银行报告册）

方向 C（文化典藏派）：
- 纸张：350 GSM 凯撒手工纸 / 米色棉纸（带毛边更佳）
- "乾"字：烫古铜金 + 深压凸 0.5mm（手感重）
- "同乾方略"：烫银
- 古钱币 watermark：局部 UV 起鼓
- 装裱：宣纸装 / 卷轴
- 可选：装入木盒（藏品级）
```

### 成本估算（一次性，500 张同款）

| 方向 | 印刷成本 | 设计精修 | AI 生成试错 | 合计 |
|---|---|---|---|---|
| A 拍卖图录 | ¥ 6,000 - 9,000 | ¥ 2,000 - 4,000 | ¥ 100 - 300 | **¥ 8,000 - 13,000** |
| B 私人银行 | ¥ 4,500 - 7,000 | ¥ 1,500 - 3,000 | ¥ 100 - 200 | **¥ 6,000 - 10,000** |
| C 文化典藏 | ¥ 8,000 - 14,000（手工纸贵） | ¥ 3,000 - 6,000 | ¥ 200 - 500 | **¥ 11,000 - 20,000** |
| **三联套合印 1500 张** | — | — | — | **约 ¥ 25,000 - 40,000** |



---

## 🚨 共用红线（v2 海报全部遵守）

### 中文文字防乱码 4 件套（与图册共用）

```
1. 列出所有要出现的中文（让模型对照）
2. 强调 "Strictly Simplified Chinese, no Traditional, no Japanese kanji"
3. 字号 ≥ 14pt（防止小字糊掉）
4. 关键文字（标题 + 公司名 + 网址）后期由设计师替换为正版思源宋体

如出现乱码，按图册 v2 的同款处理流程。
```

### 风格统一性自检（每张海报生成后过一遍）

```
□ 配色仅用 v2 色板（无 #1e5fbf / 无 #d4953a / 无纯白）
□ 中文标题为 Source Han Serif（非苹方 / 非微软雅黑）
□ 英文标题为衬线体（非 Helvetica / 非 Inter）
□ 留白 ≥ 50%
□ 主信息块 ≤ 3 个
□ 含至少一个 logo 元素延伸（罗盘 / 螺旋 / 古钱币方孔 / "乾"字）
□ 避免 SaaS infographic 感
□ 避免 isometric 3D / 卡通插画 / 商务握手
□ 含印刷质感（embossed / film grain / paper texture）
□ 含金属质感（brushed metal / gold foil / metallic disc）
□ 含网址 www.tongqian.io（非 .com）
□ 含全名"湖北省同乾咨询有限公司"
```



---

## 📦 与图册的关系

| 资产 | 用途 | 张数 | 文件 |
|---|---|---|---|
| **海报**（本文件）| 单页传播 / 展位主视觉 / 公众号头图 | 3 张方向（A/B/C 任选或组合）| `poster-master.md` |
| **业务图册** | 12 页装订成册 / 商务洽谈 / 客户随手翻 | 12 张（封面 + 11 内页）| `brochure-deck.md` |

**两者共享 BASE STYLE v2**，确保印刷品同时拿出时视觉一致。
**推荐采购组合**：方向 A 海报 ×500 张 + 12 页图册 ×500 册 = 完整宣传弹药库（约 ¥ 25,000）。



---

**版本**：v2.0（基于 logo 重写，与图册 v2 配套）
**日期**：2026-05-16
**适用**：湖北省同乾咨询有限公司 · 同乾方略品牌 · 2026 年宣传物料
**审美锚定**：故宫文创 / 苏富比 / 中国银行年报 / Pentagram brand book
