# 同乾方略 · 业务图册 12 张 Premium Prompt v2

> 配套同乾方略 logo（深蓝底 + 银色螺旋 + 古铜方孔铜钱 + 罗盘构图）的视觉系统重写。
> 公司：**湖北省同乾咨询有限公司**　|　网站：**www.tongqian.io**　|　地址：中国武汉


---

## 🎨 Visual System v2（基于 logo 重写的视觉宪法）

### 配色（从 logo 反向提取，完全替换 v1 的"麦肯锡黑金"）

```
主背景：    Deep Imperial Navy   #0f1d3a   (像故宫夜空 / 中国银行深蓝)
深背景：    Midnight Ink         #050a18   (深空 / 烫黑)
古铜玫瑰金：Antique Bronze       #b87a55   (logo 中心铜钱色)
古铜暖光：  Warm Copper          #c89070   (古铜钱反光高光)
抛光银：    Brushed Platinum     #c8ccd4   (logo 螺旋臂主色)
冷银高光：  Cool Pearl           #e8ebf0   (银色边缘反光)
象牙暖白：  Ivory Cream          #f0e7d4   (高级宣纸色 / 标题副本色)
水墨黑：    Ink Black            #1a1a1a   (正文)

❌ 绝不用：
- 任何饱和蓝（#1e5fbf 太互联网）
- 任何亮金黄（#d4953a 太俗气）
- 任何纯白（要用象牙白 #f0e7d4 / 暖灰白 #f5f1e8）
```

### 关键视觉符号（每张图必须包含至少 1 个）

```
1. logo 元素延伸：圆形罗盘 / 螺旋线 / 古钱币方孔
2. 中国传统几何：宋画山水构图 / 卷轴对页 / 印章红
3. 建筑业符号：施工蓝图线条 / 等高线 / 建筑剖面图
4. 古今对话：传统纹样 + 现代数据图表叠加
```

### 字体系统（贵到便宜）

```
中文标题：方正悠宋 思源宋体 Light → 思源黑体 ExtraLight
中文正文：方正兰亭刊宋 / 思源宋体 Regular
英文标题：GT Sectra Display / Tiempos Headline
英文正文：Söhne Breit / Tiempos Text
数字 / 数据：GT Alpina Mono / 思源等宽

❌ 绝不用：苹方 / 微软雅黑（太通用）/ Inter（太硅谷）
```

### 排版纪律

```
- 留白 ≥ 50%（高端的本质）
- 单页主信息块 ≤ 3 个（不堆砌）
- 网格：12 列瑞士派 / 印刷级 24mm 边距
- 标题字号 ≥ 96pt（敢留白才敢大字）
- 正文 ≤ 14pt（克制）
- 行间距 1.6-1.8x（呼吸感）
- 烫金 / 压凸感（描述时用 "embossed gold foil" / "letterpress")
```

### 全套 BASE STYLE token（每张 prompt 复用）

```
[BASE STYLE v2]
Premium corporate brochure for "Hubei Tongqian Consulting Co., Ltd. 
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
- Swiss 12-column grid, 24mm margins
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
- Saturated #1e5fbf blue (too internet-y), bright #d4953a yellow (too cheap)
- Multiple icons per page, KPI dashboards, isometric 3D illustrations
- Gradient backgrounds, neon, glitter, sparkles
- Cartoon characters, photorealistic faces, stock photos
- Sans-serif title fonts, bold display fonts, condensed type
- E-commerce style, taobao colors, flash sale aesthetic
- Garbled chinese, traditional chinese, japanese kanji
- Saas dashboard style, silicon valley tech-startup feel
```



---

## 📕 第 1 张 · 封面（Cover）

### 中文必出文字（强制简体方正）

```
同乾方略
建筑产业 · 智能经营 · 战略咨询
中国 · 武汉
湖北省同乾咨询有限公司
2026 业务图册
```

### Prompt（推荐 Midjourney v7 + 喂 logo 作 reference）

```
Premium brochure cover for "Tongqian Fanglue 同乾方略" 
(Hubei Tongqian Consulting Co., Ltd.), 27cm × 40cm vertical, 300dpi.

FULL FRAME composition:
A deep imperial navy #0f1d3a background, with extremely subtle 
embossed paper texture and 5% film grain.

CENTER (occupying 28% of vertical height, vertically centered at 38% from top):
The company logo placed prominently — a circular medallion combining:
- 8 silver brushed-platinum spiral blades arranged radially (像罗盘指针 / 8 道太极螺旋)
- Center: a古铜玫瑰金 ancient Chinese square-hole coin (古钱币方孔), warm copper #b87a55
- Two small platinum dots offset (top-left and bottom-right of medallion) — orbital satellites
- Logo diameter approximately 280px in design, with subtle metallic light reflection on top
- Drop shadow soft, depth feel like an embossed metal seal on dark velvet

Above logo, tiny ivory cream text #f0e7d4, all caps, letter-spacing +30%, 12pt:
"BUSINESS BROCHURE  ·  VOLUME ONE  ·  2026"

Below logo, vertical spacing 80px, then:
Massive Chinese title in Source Han Serif Light (思源宋体 极细), 
ivory cream #f0e7d4, weight thin, 144pt, letter-spacing +8%, centered:
"同乾方略"

Below title, hairline divider in antique bronze #b87a55, 0.5px thick, 
240px wide, centered.

Sub-title in cool pearl #c8ccd4, light serif, 28pt, centered, letter-spacing +4%:
"建筑产业 · 智能经营 · 战略咨询"

Tiny English line below, 13pt, antique bronze 70% opacity, all caps, 
letter-spacing +30%:
"CONSTRUCTION INTELLIGENCE  ·  STRATEGIC ADVISORY"

FAR BOTTOM (bottom 8% of canvas):
Three lines of micro-text, all caps, antique bronze 50% opacity, 
letter-spacing +25%, 10pt, centered:
Line 1: "湖北省同乾咨询有限公司"
Line 2: "HUBEI TONGQIAN CONSULTING CO., LTD."
Line 3: "WUHAN  ·  CHINA  ·  WWW.TONGQIAN.IO"

VISUAL FEEL:
Like a museum exhibition catalog cover from the Palace Museum gift shop,
or a private bank's annual report, or Sotheby's auction preview.
The logo should feel like a brushed-metal medallion embossed onto 
midnight-blue velvet stock paper. Heavy. Sophisticated. Quietly expensive.

[BASE STYLE v2]
NEGATIVE: 
infographic, dashboard, isometric 3D, illustration of buildings, 
photo of people, stock imagery, gradient background, neon, glitter,
sans-serif display title, helvetica, inter, bold heavy fonts,
multiple visual elements, cluttered composition, decorative ornaments,
chinese garbled characters, traditional chinese, japanese kanji,
saturated bright blue, yellow gold, e-commerce, taobao,
modern startup tech aesthetic, silicon valley style
```



---

## 📊 第 2 张 · 序章 · 致建筑业的一封信（Foreword）

### 中文必出文字

```
致中国建筑业
我们身处一个被低估的产业
建筑业贡献中国 GDP 的 7%
养育 5400 万从业者
却仍以 30 年前的方式经营
找活靠人脉 看合同靠经验
管资质靠记性 算造价靠表格
我们想换一种方式
让中小型建筑公司的老板
每天用 30 分钟搞定一周的决策
这是同乾方略的开始
湖北省同乾咨询有限公司
2026 年春
```

### Prompt

```
Editorial spread page, "A Letter to China's Construction Industry".
Single-page A4 portrait at 300dpi.

LEFT 40% — vertical strip of imperial navy #0f1d3a:
Single elegant brushed-platinum vertical line (1px) running floor to ceiling 
along the right edge of this strip.
Top of strip: tiny ivory cream caps text 11pt, letter-spacing +30%, rotated 0:
"致建筑业"
"A LETTER TO THE INDUSTRY"

RIGHT 60% — ivory cream paper background #f0e7d4:
Single column of Chinese text, Source Han Serif Light (思源宋体 Light), 
ink black #1a1a1a, 18pt, line-height 1.8x, justified left.
Generous top margin 20% of page height before text begins.

The text body (verbatim, line breaks shown):
"我们身处一个被低估的产业。"

"建筑业贡献中国 GDP 的 7%，"
"养育 5,400 万从业者，"
"却仍以 30 年前的方式经营。"

"找活靠人脉，看合同靠经验，"
"管资质靠记性，算造价靠表格。"

"我们想换一种方式 —"
"让中小型建筑公司的老板，"
"每天用 30 分钟，搞定一周的决策。"

"这是同乾方略的开始。"

(Significant whitespace below, then signature aligned right)

In smaller italic-style 14pt antique bronze #b87a55:
"—— 湖北省同乾咨询有限公司"
"2026 年春"

VERY BOTTOM RIGHT corner (10pt cool pearl #c8ccd4, all caps, 
letter-spacing +25%):
"FOREWORD  ·  PAGE TWO"

VISUAL FEEL:
Like the foreword page of a private equity fund annual letter, 
or Berkshire Hathaway shareholder letter aesthetic.
Restrained. Confident. Personal.

[BASE STYLE v2]
NEGATIVE: 
multiple text columns, sidebars, infoboxes, illustrations, photos,
icons, decorative ornaments, dashboards, charts, visual clutter
```



---

## 🎯 第 3 张 · 行业 5 大经营之痛（Pain Points）

### 中文必出文字

```
建筑业经营之痛
壹 找活难 招投标信息分散 机会捕获效率低
贰 风险高 合同陷阱多 业主真假难辨
叁 资质难 升级流程复杂 错过窗口期
肆 现金紧 应收账款积压 融资渠道有限
伍 管理重 文档多 流程杂 人手少
我们用 AI 把这五件事压缩到老板每天 30 分钟解决
```

### Prompt

```
Editorial museum-catalog style page, "Five Pain Points of China Construction".
A4 portrait, 300dpi.

TOP 15% — imperial navy #0f1d3a band:
Centered ivory cream Chinese title 36pt Source Han Serif Light:
"建筑业经营之痛"
Below in tiny copper caps 11pt: 
"FIVE CRITICAL PAINS"

MIDDLE 70% — ivory cream paper #f0e7d4 background:
Five horizontal rows, each row separated by hairline antique bronze divider 0.5px.

Each row layout (left to right):
- LEFT: large Chinese ordinal number in古铜玫瑰金 #b87a55, GT Sectra Display 
  or 思源宋体 Light, weight thin, 96pt, vertically centered:
  "壹" "贰" "叁" "肆" "伍"
- CENTER: vertical thin platinum line 0.5px height 60% of row
- RIGHT 80%: 
  Top: Chinese title 26pt ink black, regular weight:
  "找活难" / "风险高" / "资质难" / "现金紧" / "管理重"
  Below, smaller 14pt warm gray #6b6b6b:
  Description text — see verbatim list

Row content verbatim:
Row 1 ("壹"): 
  Title: "找活难"
  Sub: "招投标信息分散 · 机会捕获效率低"
Row 2 ("贰"):
  Title: "风险高"
  Sub: "合同陷阱多 · 业主真假难辨"
Row 3 ("叁"):
  Title: "资质难"
  Sub: "升级流程复杂 · 错过窗口期"
Row 4 ("肆"):
  Title: "现金紧"
  Sub: "应收账款积压 · 融资渠道有限"
Row 5 ("伍"):
  Title: "管理重"
  Sub: "文档多 · 流程杂 · 人手少"

BOTTOM 15% — solid antique bronze #b87a55 strip:
Centered ivory cream text, 22pt Source Han Serif Light:
"我们用 AI 把这五件事 · 压缩到老板每天 30 分钟解决"

Far bottom right corner (white 60%, 10pt all caps):
"03  ·  PAIN POINTS"

VISUAL FEEL:
Like a chapter divider in a high-end book on Chinese commerce.
The 大写汉字数字 (壹贰叁肆伍) gives it a traditional / financial feel,
appropriate for a consulting firm rooted in Chinese business culture.

[BASE STYLE v2]
NEGATIVE:
photos of stressed people, sad faces, dark dramatic mood,
red warning colors, exclamation marks, urgent language,
icons next to each pain point, infographic style
```



---

## 🏛 第 4 张 · 同乾哲学（Brand Philosophy）

### 中文必出文字

```
同乾
取自易经 · 乾卦
天行健 君子以自强不息
建筑业是天下最艰难的行业之一
我们陪伴中小型建筑企业
以乾卦的稳健 · 同心的协力
走过经营路上的每一个周期
```

### Prompt

```
Philosophical centerfold spread page. A4 portrait, 300dpi.

FULL FRAME: deep imperial navy #0f1d3a background, 
heavy paper texture visible, subtle 5% film grain.

UPPER 35%:
Centered, very large traditional Chinese character "乾" (qián, the trigram of 
heaven from I-Ching), in antique bronze #b87a55, weight thin Source Han Serif, 
240pt, with subtle metallic embossed effect, slight 3D depth giving it 
the feel of a Chinese stone seal or bronze relic. The character should look 
historical, like it's carved from oxidized bronze, NOT modern flat design.

Below the character "乾", a thin antique bronze hairline 0.5px, 200px wide.

Tiny ivory cream caps below, 12pt, letter-spacing +30%:
"QIAN  ·  HEAVEN  ·  STRENGTH  ·  PERSEVERANCE"

CENTER (vertically centered at 55%):
Single elegant Chinese line in ivory cream #f0e7d4, 
Source Han Serif Light, 32pt, centered:
"取自《易经》乾卦"

Below, slightly smaller 24pt cool pearl #c8ccd4, italic-style:
"天行健 · 君子以自强不息"

Below, 14pt antique bronze 70% opacity, regular:
"The way of Heaven is dynamic. The wise pursue strength without ceasing."

LOWER 30%:
Three lines of Chinese, 18pt ivory cream, line-height 2x, centered:
"建筑业是天下最艰难的行业之一"
"我们陪伴中小型建筑企业"
"以乾卦的稳健 · 同心的协力"
"走过经营路上的每一个周期"

VERY BOTTOM (10pt cool pearl 50% opacity, all caps, letter-spacing +25%):
"04  ·  BRAND PHILOSOPHY"

VISUAL FEEL:
Like opening a private banker's wealth philosophy book, or a Forbidden City 
exhibition catalog. Quiet authority. Cultural depth. The "乾" character 
should feel like an ancient bronze artifact, not a modern font.

[BASE STYLE v2]
NEGATIVE:
modern font for "乾" character, flat design, sans-serif,
illustration of mountains or sky, photo of Forbidden City, 
people, Buddhist imagery, calligraphy brush effects,
ornamental dragons, golden patterns, oriental cliche decorations
```



---

## 🛠 第 5 张 · 五大杀手锏（Five Killer Modules）

### 中文必出文字

```
五大杀手锏
直击建筑企业核心需求
壹 经营机会雷达 每日机会推送 业主真假性核验 可投性 AI 评分
贰 投标标书工厂 招标速读 资格自查 标书框架 AI 生成
叁 资质智能管家 证书 OCR 入档 升级路径 业绩库 到期提醒
肆 合同风险审查 30 秒老板版 5 分钟详细 PDF 修改意见函
伍 经营成本工具集 AI 老板助理 一键催收 工作汇报 政策解读
```

### Prompt

```
Editorial 5-column module grid page. A4 landscape (1754x1240px).

TOP 12% — imperial navy #0f1d3a strip:
Centered ivory cream Chinese title 42pt Source Han Serif Light, 
letter-spacing +6%:
"五 大 杀 手 锏"
Below, tiny copper caps 11pt:
"FIVE KILLER MODULES  ·  CORE CAPABILITY"

MIDDLE 76% — ivory cream paper #f0e7d4 background:
Five vertical columns, equal width, separated by 0.5px antique bronze 
hairline dividers (vertical lines).

Each column structure:
- TOP 25%: Big Chinese ordinal number 大写 "壹/贰/叁/肆/伍" in antique 
  bronze #b87a55, Source Han Serif Light thin, 80pt, centered.
- 30%: Module Chinese title 22pt ink black, regular weight, centered.
  Below, English subtitle 11pt cool pearl #888 caps, letter-spacing +20%, centered.
- 45%: 4 bullet points (Chinese 13pt ink black 80% opacity, regular), 
  each bullet preceded by tiny antique bronze square dot 4x4px, left-aligned 
  with column padding.

Column 1 (壹):
  "经营机会雷达"
  "OPPORTUNITY RADAR"
  · 每日匹配机会推送
  · 业主真假性核验
  · 可投性 AI 评分
  · 同行雷达对比

Column 2 (贰):
  "投标标书工厂"
  "TENDER FACTORY"
  · 招标文件 5 分钟速读
  · 资格自查清单
  · 商务/技术标框架生成
  · 章节 AI 续写

Column 3 (叁):
  "资质智能管家"
  "QUALIFICATION GUARD"
  · 证书 OCR 自动入档
  · 升级路径 AI 规划
  · 业绩库自动匹配
  · 到期 90/60/30 天提醒

Column 4 (肆):
  "合同风险审查"
  "CONTRACT REVIEW"
  · 30 秒老板版速读
  · 5 分钟详细 PDF
  · 6 类风险智能识别
  · 修改意见函生成

Column 5 (伍):
  "经营成本工具集"
  "OPERATIONS TOOLKIT"
  · AI 老板助理对话
  · 一键催收函
  · 工作汇报生成
  · 政策影响解读

BOTTOM 12% — solid antique bronze #b87a55 strip:
Centered ivory cream Chinese 18pt Source Han Serif Light:
"覆盖建筑企业老板每天 90% 的经营决策场景"
Below, tiny English 10pt opacity 60%:
"Covering 90% of daily strategic decisions for construction CEOs"

Far right corner (10pt opacity 50% all caps):
"05  ·  CAPABILITY MAP"

[BASE STYLE v2]
NEGATIVE:
icons in cards, illustrations, screenshots, 3D mockups,
saturated colors, gradient backgrounds, modern startup feel
```



---

## 🔄 第 6 张 · 三层服务漏斗（Service Funnel）

### 中文必出文字

```
三层服务漏斗
从 AI 工具到战略陪伴的商业闭环
第一层 AI 工具订阅 月费 39-999 元
第二层 智能管家标准服务派单 客单 3000-100000 元
第三层 同乾方略标准咨询 客单 5 万-30 万元
战略层 同乾方略战略顾问 年费 30 万-100 万元
平均生命周期 36 个月 · 客户终身价值 1.2 万元
```

### Prompt

```
Single-page funnel diagram. A4 portrait, 300dpi.

TOP 12% — imperial navy strip:
Centered ivory cream title 36pt Source Han Serif Light:
"三 层 服 务 漏 斗"
Below caps 11pt copper: 
"FROM AI TOOL TO STRATEGIC PARTNERSHIP"

CENTER 70% — deep imperial navy #0f1d3a background:
A precise inverted pyramid composed of 4 horizontal trapezoidal slices,
each slice rendered like brushed metal plates with subtle metallic 
gradient effect.

Slice 1 (top, widest, brushed platinum #c8ccd4):
  Inside text, ink black, centered:
  Big Chinese 24pt: "AI 工具订阅"
  Small caps 10pt: "SAAS SUBSCRIPTION"
  Right edge price: "¥ 39 - 999 / 月" copper #b87a55, 18pt

Slice 2 (cool pearl #a8b0c0):
  Big: "智能管家标准服务派单"
  Caps: "AGENT DISPATCH NETWORK"
  Price: "¥ 3,000 - 100,000"

Slice 3 (warm copper #c89070):
  Big: "同乾方略标准咨询"
  Caps: "TONGQIAN ADVISORY"
  Price: "¥ 50,000 - 300,000"

Slice 4 (bottom, narrowest, antique bronze #b87a55, deep saturated):
  Text in ivory cream:
  Big: "战略顾问"
  Caps: "STRATEGIC PARTNER"
  Price: "¥ 300,000 - 1,000,000+ / 年"

To the right of the pyramid, a vertical thin platinum line 0.5px running 
floor to ceiling, with 4 small metallic dots aligned to each slice level.
Alongside each dot, micro caps 9pt copper, all caps:
"01  TOOL"
"02  AGENT"
"03  ADVISORY"
"04  PARTNER"

BOTTOM 18% — ivory cream strip:
Three centered lines:
Line 1 (16pt ink black bold-ish):
"客户成长路径 · CUSTOMER LIFETIME JOURNEY"
Line 2 (24pt copper #b87a55):
"36 个月  ·  ¥ 12,000 LTV"
Line 3 (12pt warm gray, italic-style):
"我们与客户共同成长 · 从 SaaS 工具到长期伙伴"

Far bottom right (10pt 50% opacity caps):
"06  ·  SERVICE FUNNEL"

[BASE STYLE v2]
NEGATIVE:
flat triangular shape, plain colored slices, generic flat funnel chart,
icons inside slices, busy text, clutter
```



---

## 🌐 第 7 张 · 智能管家裂变网络（Three-Tier Agent Network）

### 中文必出文字

```
智能管家裂变网络
四类智能管家 · 三级分润 · 五等信誉
推荐型 资源型 派单型 服务商型
首年分润 30% · 次年 20% · 充值返佣 15%
LV1 见习管家 LV2 入职管家 LV3 资深管家 LV4 金牌管家 LV5 首席管家
信誉决定派单优先级 · 服务质量决定信誉
免保证金 · 实名审核即可上岗 · 推荐 0 抽成
跨域介绍费 5% · 客户保护期 7 天
```

### Prompt

```
Editorial network diagram page. A4 portrait, 300dpi.

TOP 12% — imperial navy #0f1d3a strip:
Centered ivory cream Chinese title 36pt Source Han Serif Light, 
letter-spacing +6%:
"中 介 裂 变 网 络"
Below copper caps 11pt: 
"AGENT DISTRIBUTION NETWORK  ·  FOUR ARCHETYPES"

UPPER MIDDLE 35% — deep imperial navy background:
A precise abstract network diagram, NOT a flowchart.
At the center: a single antique bronze #b87a55 古钱币方孔 ancient Chinese 
coin (echoing the company logo), diameter 80px, embossed effect.
Around it, 4 satellite nodes positioned at compass points (N/E/S/W), 
each node a smaller brushed-platinum circle 50px diameter, connected to 
center by hairline 0.5px antique bronze radial lines.

Each satellite node label (Chinese 14pt ivory cream above the dot, 
English caps 10pt copper #b87a55 below):
North:    "推荐型 智能管家"  ·  "REFERRAL"
East:     "资源型 智能管家"  ·  "RESOURCE"
South:    "派单型 智能管家"  ·  "DISPATCH"
West:     "服务商型"     ·  "SERVICE PROVIDER"

Outer ring (faint 0.3px platinum hairline circle around all 4 nodes), 
representing the "client protection zone".

LOWER MIDDLE 38% — ivory cream paper #f0e7d4 background:

LEFT 50% — Three-tier commission structure:
Section title 14pt ink black caps letter-spacing +25%: 
"分润结构  ·  COMMISSION TIERS"
Below, 3 horizontal rows separated by 0.5px copper hairlines:
Row 1: 大写 "壹" 24pt copper | "首年订阅分润" 14pt | "30%" 24pt copper bold
Row 2: 大写 "贰" 24pt copper | "次年订阅分润" 14pt | "20%" 24pt copper
Row 3: 大写 "叁" 24pt copper | "充值消费返佣" 14pt | "15%" 24pt copper

RIGHT 50% — Five-level reputation:
Section title 14pt ink black caps: 
"信誉等级  ·  REPUTATION LEVELS"
Below, 5 rows compact, each row:
Tiny circular metallic chip (20px) + Chinese label + score range
Row 1: platinum chip "LV1 见习管家"  300-499 分
Row 2: cool pearl "LV2 入职管家"     500-649
Row 3: warm gray "LV3 资深管家"      650-799
Row 4: warm copper "LV4 金牌管家"    800-899
Row 5: deep antique bronze "LV5 首席管家"  900-1000
(LV5 row slightly larger, hint of metallic shimmer)

BOTTOM 15% — solid antique bronze #b87a55 strip:
Centered ivory cream three lines, 14pt regular:
"免保证金 · 实名审核即上岗  ·  推荐 0 抽成  ·  跨域介绍费 5%"
"客户保护期 7 天  ·  退款扣回分润  ·  反薅羊毛 5 维去重"
Tiny caps below 10pt opacity 70%:
"GUARANTEED FAIR DISTRIBUTION FOR ALL AGENTS"

Far bottom right corner (10pt cool pearl 50%, caps, letter-spacing +25%):
"07  ·  AGENT NETWORK"

VISUAL FEEL:
Like a financial product structure diagram in a private bank prospectus.
The center coin echoes the company logo. Restraint over decoration.

[BASE STYLE v2]
NEGATIVE:
cartoon people icons, hand-drawn networks, social media style avatars,
multi-level marketing pyramid imagery, MLM aesthetic,
flowchart with arrows, animation effects, lens flare,
human silhouettes, 3D characters
```



---

## 🤝 第 8 张 · 合伙人招募说明（Agent Recruitment Page）

### 中文必出文字

```
诚邀同行者
我们寻找的智能管家合伙人
有建筑业资源的退役销售
有政企人脉的渠道经理
有项目经验的专业顾问
有客户基础的服务商
您的回报
零门槛入驻 · 实名审核即上岗
首笔订单一次性奖励 200 元
推荐客户终身分润 30% / 20% / 15%
信誉满 LV4 自动入选金牌管家俱乐部
扫码申请入驻 · 同乾方略·智能管家合伙人计划
```

### Prompt

```
Editorial recruitment page. A4 portrait, 300dpi.

TOP 22% — imperial navy #0f1d3a band:
Far left edge: vertical thin antique bronze line 0.5px floor to ceiling.
Centered Chinese title 48pt Source Han Serif Light, ivory cream #f0e7d4, 
letter-spacing +6%:
"诚邀同行者"
Below in 16pt cool pearl, italic-style: 
"WE INVITE THE COMPANIONS OF THE WAY"
Below in 11pt copper caps letter-spacing +30%:
"AGENT PARTNERSHIP PROGRAM  ·  2026"

MIDDLE LEFT 50% — ivory cream paper #f0e7d4:
Section heading 16pt ink black bold-ish: 
"我们寻找的伙伴"
Below in copper caps 9pt letter-spacing +25%: 
"WHO WE LOOK FOR"

Below, 4 stacked items separated by 0.5px copper hairlines, 
each item: large 大写 ordinal number left + description right:

壹 (40pt copper)  | 有建筑业资源的退役销售
贰 (40pt copper)  | 有政企人脉的渠道经理
叁 (40pt copper)  | 有项目经验的专业顾问
肆 (40pt copper)  | 有客户基础的服务商

Each "description" 16pt ink black regular, vertical-centered with the number.

MIDDLE RIGHT 50% — imperial navy #0f1d3a panel:
Section heading 16pt ivory cream regular: 
"您的回报"
Below copper caps 9pt:
"WHAT YOU GAIN"

Below, 4 items each item structured as:
- Top: large copper number/percentage 32pt GT Sectra:
  "¥0"
  "¥200"
  "30/20/15%"
  "LV4"
- Bottom: smaller Chinese 13pt cool pearl #c8ccd4:
  "零门槛入驻 · 免保证金 · 不绑销售指标"
  "首笔订单一次性奖励"
  "首年 / 次年 / 充值 三档分润"
  "信誉满级 · 自动入金牌管家俱乐部"

Items separated by 0.5px platinum hairlines.

BOTTOM 20% — ivory cream strip:
LEFT 60%:
Single line 18pt ink black Source Han Serif Light:
"扫码申请入驻 · 同乾方略·智能管家合伙人计划"
Below 11pt warm gray italic:
"Scan to apply  ·  Tongqian Agent Partner Program"

RIGHT 40%:
A clean QR code placeholder, 180x180px, antique bronze frame 1px, 
inside placeholder text: 
"[ QR CODE PLACEHOLDER ]"
"agents.tongqian.io/apply"

Far bottom right corner (10pt 50% opacity all caps):
"08  ·  AGENT RECRUITMENT"

VISUAL FEEL:
Like a private banking VIP invitation, or a literary salon membership card.
Confident invitation, not aggressive sales pitch.

[BASE STYLE v2]
NEGATIVE:
photos of smiling sales people, handshake imagery, money symbols,
"limited time offer" banners, countdown timers, urgency badges,
multi-level commission diagrams, MLM imagery, pyramid schemes
```



---

## 🛡 第 9 张 · 合规与安全（Compliance & Security）

### 中文必出文字

```
合规为本 · 安全先行
四层数据隔离
租户层 · 部门层 · 项目层 · 个人层
七大合规承诺
个人信息保护法 PIPL · 数据本地化存储
出境数据强制脱敏 · 政府版禁用海外模型
全链路审计日志保留六年 · 加密存储金融级
租户数据物理隔离 · 跨租户拒绝零容忍
我们认为合规不是成本 · 是产品的根基
```

### Prompt

```
Editorial compliance manifesto page. A4 portrait, 300dpi.

TOP 14% — imperial navy #0f1d3a strip:
Centered ivory cream Chinese title 36pt Source Han Serif Light:
"合 规 为 本  ·  安 全 先 行"
Below copper caps 11pt: 
"COMPLIANCE FIRST  ·  SECURITY BY DESIGN"

UPPER MIDDLE 32% — deep imperial navy panel:
A clean architectural diagram of "Four-Layer Data Isolation" — 
4 nested concentric squares, each progressively smaller, like a Chinese 
imperial seal cabinet (印章套盒).
Outer (largest) square: 0.5px brushed platinum line, label top-left 
corner: "层 壹  TENANT  租户层"
Layer 2: 0.5px cool pearl line, label: "层 贰  DEPARTMENT  部门层"
Layer 3: 0.5px warm copper line, label: "层 叁  PROJECT  项目层"
Innermost (smallest): solid antique bronze fill, no border, 
center contains a single tiny古钱币方孔 coin glyph in ivory cream:
Label: "层 肆  PERSONAL  个人层"

To the right of the diagram, vertical caption text 11pt cool pearl, 
letter-spacing +25%, all caps, rotated 90°:
"DATA SOVEREIGNTY  ·  ZERO CROSS-TENANT LEAKAGE"

LOWER MIDDLE 40% — ivory cream paper #f0e7d4:
Title 16pt ink black bold-ish, centered: 
"七 大 合 规 承 诺"
Below copper caps 9pt:
"SEVEN COMPLIANCE COMMITMENTS"

Below, 7 rows in a clean tabular layout with 0.5px copper hairline dividers, 
each row: large 大写 ordinal left (24pt copper) + Chinese description 
right (14pt ink black):

壹 | 严守《个人信息保护法》全部条款
贰 | 数据本地化存储 · 全部位于中国境内
叁 | 出境调用模型前 · 强制脱敏处理
肆 | 政府 · 央国企版 · 强制使用国产模型
伍 | 全链路审计日志 · 留存六年不可删除
陆 | 金融级加密存储 · AES-256 · 字段级密钥
柒 | 租户数据物理隔离 · 跨租户访问 · 零容忍

BOTTOM 14% — solid antique bronze #b87a55 strip:
Centered ivory cream Chinese 18pt, italic-style:
"我们认为合规不是成本 · 是产品的根基"
Below 11pt cool pearl 70%:
"We believe compliance is not a cost — it is the foundation."

Far bottom right corner (10pt 50% all caps):
"09  ·  COMPLIANCE & SECURITY"

VISUAL FEEL:
Like a sovereign-grade financial compliance document. Authoritative. 
Calm. The nested-square diagram echoes Chinese seal-box (印盒) culture.

[BASE STYLE v2]
NEGATIVE:
shield icons, padlock icons, fingerprint imagery, hacker hoodie photo,
red alert colors, scary security warnings, technical jargon dense layout,
firewall diagrams, network topology with servers
```



---

## 📈 第 10 张 · 五年增长路线图（Growth Roadmap）

### 中文必出文字

```
五年增长路线图
2026 至 2030
2026 元年 服务客户 1500 家 营收 4500 万 净利 1800 万
2027 全国扩张 客户 4000 家 营收 1.2 亿 净利 5500 万
2028 标杆建立 客户 8000 家 营收 2.4 亿 净利 1.2 亿
2029 行业深耕 客户 15000 家 营收 4.5 亿 净利 2.4 亿
2030 战略生态 客户 25000 家 营收 8.0 亿 净利 4.5 亿
五年累计客户 25000 家 累计营收 20.6 亿元
建筑业 AI 赛道 第一品牌
```

### Prompt

```
Editorial growth chart page. A4 landscape (1754x1240px), 300dpi.

TOP 12% — imperial navy strip:
Centered ivory cream Chinese title 36pt Source Han Serif Light:
"五 年 增 长 路 线 图"
Below copper caps 11pt:
"FIVE-YEAR GROWTH TRAJECTORY  ·  2026 - 2030"

MIDDLE 70% — ivory cream paper #f0e7d4:
A horizontal "trajectory" timeline, NOT a typical bar chart.
5 vertical pillar columns equally spaced, each pillar a thin 
brushed-metal vertical bar with its top reaching different heights 
(progressive growth). Pillars in this color sequence (low to high):
2026: brushed platinum #c8ccd4 (shortest, 35% height)
2027: cool pearl #a8b0c0 (50%)
2028: warm copper #c89070 (65%)
2029: antique bronze #b87a55 (80%)
2030: deep bronze gradient (tallest, 95%)

At the TOP of each pillar, a small embossed ancient-coin disc (15px diameter) 
of warm copper #b87a55, like landmark milestones.

Above each pillar's coin, year label 18pt ink black GT Sectra:
"2026" "2027" "2028" "2029" "2030"

Below year, in 4-line stack (each ≤ 12pt, line height 1.5x), centered:
Line A (Chinese phase tag, 13pt ink black bold-ish):
"元年" / "全国扩张" / "标杆建立" / "行业深耕" / "战略生态"
Line B (clients, 11pt warm gray):
"1,500 客户" / "4,000" / "8,000" / "15,000" / "25,000"
Line C (revenue, 12pt copper #b87a55):
"¥4,500 万" / "¥1.2 亿" / "¥2.4 亿" / "¥4.5 亿" / "¥8.0 亿"
Line D (profit, 10pt cool pearl darker #a0a0a0):
"净利 ¥1,800 万" / "5,500 万" / "1.2 亿" / "2.4 亿" / "4.5 亿"

Below all 5 pillars, single 0.5px antique bronze hairline running full 
width — the "horizon line".

Above the chart, top-right area (40% width):
A single elegant chart legend in 11pt copper caps, letter-spacing +25%:
"●  CLIENTS    ●  REVENUE    ●  NET PROFIT"

BOTTOM 18% — imperial navy #0f1d3a strip:
LEFT 60% — single line 22pt ivory cream, Source Han Serif Light:
"五年累计 · 25,000 家客户 · 营收 ¥20.6 亿元"
Below 12pt cool pearl 70% caps letter-spacing +25%:
"FIVE-YEAR CUMULATIVE  ·  25,000 CLIENTS  ·  RMB 2.06 BILLION"

RIGHT 40%:
Vertical-stacked, right-aligned:
Line 1 caps 11pt copper:
"TARGET POSITION 2030"
Line 2 ivory cream 24pt Source Han Serif:
"建筑业 AI 第一品牌"

Far bottom right corner (10pt 50% caps):
"10  ·  GROWTH ROADMAP"

VISUAL FEEL:
Like the five-year plan section in a state-owned enterprise prospectus,
or the cover trajectory of an IPO listing document. Restrained ambition.

[BASE STYLE v2]
NEGATIVE:
generic bar chart, excel-style chart, 3D pillars with shadows, 
rocket emojis, growth arrows, hockey stick curve cliche,
neon glowing data points, sparkle effects, bullet markers
```



---

## ⚖️ 第 11 张 · AI 输出边界（Tier 4 级方法论）

### 中文必出文字

```
AI 输出边界
四级 Tier 方法论
第壹级 直接使用 小单 / 日常 / 速览类
第贰级 建议人工复核 中型项目 / 关键合同
第叁级 仅整理引导 大型项目 / 化债 / 融资类
第肆级 强制人工接管 涉诉 / 仲裁 / 重大博弈
每份报告必含 免责声明 · Tier 徽章 · AI 信心度 · 下一步引导
我们让 AI 知道边界 · 也让客户知道边界
```

### Prompt

```
Editorial methodology page. A4 portrait, 300dpi.

TOP 14% — imperial navy strip:
Centered ivory cream Chinese title 36pt Source Han Serif Light:
"AI 输 出 边 界"
Below copper caps 11pt: 
"FOUR-TIER OUTPUT METHODOLOGY"
Below 14pt cool pearl italic-style:
"我们让 AI 知道边界 · 也让客户知道边界"

UPPER MIDDLE 50% — ivory cream paper #f0e7d4:
4 horizontal Tier rows, each separated by 0.5px copper hairline.

Each row layout:
LEFT 18%: Big Tier badge — a circular metallic disc 90px diameter, 
centered. Disc colors per tier:
Tier 1 (success-ish): brushed platinum #c8ccd4 with subtle green tint
Tier 2 (warning-ish): warm copper #c89070 with amber tint
Tier 3 (escalation): primary navy #0f1d3a with platinum ring
Tier 4 (forbidden): deep antique bronze #b87a55 with red-bronze tint
Inside each disc, large 大写 ordinal in ivory cream / contrasting:
"壹" "贰" "叁" "肆"

CENTER 32%: Chinese tier title 22pt ink black + caps subtitle 10pt copper:
Tier 1: "直接使用"   ·  "USE DIRECTLY"
Tier 2: "建议人工复核" · "HUMAN REVIEW SUGGESTED"
Tier 3: "仅整理引导"  ·  "INFO ASSEMBLY ONLY"
Tier 4: "强制人工接管" · "MANDATORY HUMAN TAKEOVER"

RIGHT 50%: Description 13pt warm gray, line-height 1.6x:
Tier 1 desc: 
"小型合同 ≤ ¥1,000 万 · 招标速读 · 政策解读"
"AI 主动给出方案 · 客户可直接采用"

Tier 2 desc:
"中型项目 ¥1,000-5,000 万 · 资质升级 · 关键合同"
"AI 给出分析 + 建议 · 强烈建议人工复核后采用"

Tier 3 desc:
"大型项目 ≥ ¥5,000 万 · 化债 · ABS · 央企融资"
"AI 仅整理信息 · 引导客户咨询同乾方略团队"

Tier 4 desc:
"涉诉案件 · 仲裁 · 重大投诉 · 多方商务博弈"
"AI 拒绝输出方案 · 强制移交人工专家"

LOWER MIDDLE 22% — imperial navy #0f1d3a panel:
Section title 14pt ivory cream caps letter-spacing +25%:
"FOUR MANDATORY ELEMENTS  ·  四 件 强 制 要 素"

Below, 4 small horizontal cards in a row, each card:
- Tiny copper square dot 6x6
- Chinese label 13pt ivory cream
- English caps 9pt cool pearl

Card 1: "免责声明"   ·  "DISCLAIMER"
Card 2: "Tier 徽章"  ·  "TIER BADGE"
Card 3: "AI 信心度"  ·  "CONFIDENCE LEVEL"
Card 4: "下一步引导" ·  "NEXT-STEP GUIDANCE"

Cards separated by 0.5px platinum hairline verticals.

BOTTOM 14% — solid antique bronze #b87a55 strip:
Centered ivory cream Chinese 16pt italic-style:
"边界感 · 让 AI 工具不毁信誉 · 让咨询团队不被替代"
Below 10pt cool pearl 70% caps:
"BOUNDARY  ·  THE GUARDIAN OF BOTH AI AND HUMAN VALUE"

Far bottom right corner (10pt 50% caps):
"11  ·  AI BOUNDARY METHODOLOGY"

VISUAL FEEL:
Like a methodology page in a Big-4 consulting firm framework deck.
Authoritative. Self-restrained. Anti-hype.

[BASE STYLE v2]
NEGATIVE:
robot illustrations, AI brain imagery, neural network visualizations,
warning triangles, stop signs, rejection iconography,
dramatic red colors, scary cautionary visuals
```



---

## 📮 第 12 张 · 联系页（Contact Card）

### 中文必出文字

```
同乾方略
湖北省同乾咨询有限公司
HUBEI TONGQIAN CONSULTING CO LTD
中国 武汉
www.tongqian.io
官方公众号 · 同乾方略
商务合作 · biz at tongqian dot io
智能管家合伙人 · agents at tongqian dot io
咨询专线 · 4 0 0 至 即将开通
建筑产业 · 智能经营 · 战略咨询
天行健 君子以自强不息
```

### Prompt

```
Editorial closing contact card. A4 portrait, 300dpi.

FULL FRAME: deep imperial navy #0f1d3a background with 
heavy uncoated paper texture, 5% film grain, subtle vignette.

UPPER 25% — centered area:
The company logo placed prominently — circular medallion, 
8 silver brushed-platinum spiral blades + center古铜玫瑰金 ancient 
square-hole coin. Diameter 220px. Embossed feel, like a metallic seal 
on midnight velvet.

Below logo, 30px spacing:
Massive Chinese title 96pt Source Han Serif Light, ivory cream #f0e7d4, 
letter-spacing +6%, centered:
"同乾方略"

Below, hairline antique bronze divider 200px wide, 0.5px, centered.

UPPER MIDDLE 18%:
Two centered lines:
Line 1 — 20pt cool pearl regular:
"湖北省同乾咨询有限公司"
Line 2 — 12pt copper caps letter-spacing +30%:
"HUBEI TONGQIAN CONSULTING CO., LTD."

LOWER MIDDLE 30%:
A clean 2-column information layout, no boxes, just structured space.

LEFT COLUMN — heading 11pt copper caps "PHILOSOPHY":
Single line in ivory cream 18pt italic-style serif:
"建筑产业 · 智能经营 · 战略咨询"
Below in 11pt cool pearl italic:
"天行健 · 君子以自强不息"

RIGHT COLUMN — heading 11pt copper caps "CONTACT":
Stacked lines, 13pt ivory cream regular, line-height 1.8x:
"中国 · 武汉"
"www.tongqian.io"
""
Smaller 11pt cool pearl caps letter-spacing +25%:
"BUSINESS:  BIZ@TONGQIAN.IO"
"AGENT PARTNERS:  AGENTS@TONGQIAN.IO"
"HOTLINE:  400-XXX-XXXX  (COMING SOON)"

LOWER 17%:
Centered, a clean QR code placeholder, 160x160px, with antique bronze 
hairline frame, inside text 10pt opacity 50% caps:
"[ OFFICIAL WECHAT QR ]"
"OFFICIAL ACCOUNT  ·  同乾方略"

VERY BOTTOM 10% — solid antique bronze strip:
Centered, 3 micro lines of caps text, ivory cream 70% opacity, 
letter-spacing +30%, 10pt:
"END OF BROCHURE  ·  VOLUME ONE  ·  2026"
"PRIVATE & CONFIDENTIAL"
"© 2026 HUBEI TONGQIAN CONSULTING CO., LTD.  ·  ALL RIGHTS RESERVED"

VISUAL FEEL:
Like the back cover of a Sotheby's auction catalog, or the closing 
contact card of a Pentagram brand book. Quiet. Final. Memorable.

[BASE STYLE v2]
NEGATIVE:
phone icons, mail icons, social media logos (wechat/weibo/etc),
maps and pinpoints, location illustrations, contact info inside boxes,
business card mockup, thank you graphics, "GET IN TOUCH" banners,
website screenshots, app store badges, promotional QR overlays

```



---

## 📐 通用使用建议（v2）

### 推荐生成工具

| 工具 | 优势 | 推荐使用张数 |
|---|---|---|
| **Midjourney v7** | 最强排版 + 字体感觉 + 留白 | 第 1 / 4 / 12 张（视觉重点页） |
| **GPT Image 2 (DALL·E 4)** | 中文文字最准 + Layout 服指令 | 第 2 / 3 / 5 / 7 / 11 张（文字密集页） |
| **Flux 1.1 Pro Ultra** | 最高分辨率 + 最商务气质 | 第 6 / 9 / 10 张（图表页） |
| **Stable Diffusion 3.5 + ControlNet** | 复刻 logo + 精确版式控制 | 第 1 张封面（如需精确 logo 复刻）|

### 工作流（全 12 张走完）

```
第 1 步：先把 logo 文件传到 Midjourney 作 image reference
        --cref [logo_url] --cw 80
        生成第 1 张封面（最重 logo），调出满意版本

第 2 步：固定 BASE STYLE v2 参数（保存为 sref code 或 prompt 模板）
        每张图复用 [BASE STYLE v2]，只改具体内容

第 3 步：批量生成
        - 先跑第 1/4/12 三张视觉锚点
        - 通过后再跑剩余 9 张
        - 单张失败，调 prompt 不调 BASE STYLE

第 4 步：印刷前校稿
        - 中文字体由设计师替换为正版思源宋体 / 方正悠宋
        - logo 用矢量文件替换 AI 生成版
        - QR 码生成真实链接二维码贴入
        - 所有 [PLACEHOLDER] 标记替换实际内容

第 5 步：调色 + 烫金工艺
        - 印刷厂指定 Pantone 色卡：
          ※ Deep Imperial Navy → Pantone 282 C
          ※ Antique Bronze → Pantone 871 C (烫金) 或 Pantone 7565 C
          ※ Brushed Platinum → Pantone 877 C (银)
        - 标题 / logo 建议烫金工艺
        - 纸张：300 GSM 米色棉纸 / 哑光铜版 / 凯撒手工纸
```

### 成本估算（一次性投入）

| 项 | 成本 |
|---|---|
| AI 图像生成（约 80 张试错）| ¥ 200 - 600 |
| 设计师精修（中文字体替换 + logo 矢量化）| ¥ 3,000 - 8,000 |
| 摄影 / 真实照片（如需补人物 / 案例）| 一期不需要，留白即可 |
| 印刷（500 册，烫金 + 哑膜 + 锁线胶装）| ¥ 8,000 - 15,000 |
| **首批 500 册总成本** | **约 ¥ 15,000 - 25,000** |

### 复用扩展（用同一套 BASE STYLE 衍生）

```
- A4 单页传单（简化版第 5 张五大杀手锏）
- 微信公众号封面图（复用第 4/6/11 张构图）
- 朋友圈宣传卡片（裁切第 5/7 张为 1:1 方图）
- 合伙人招募 H5 海报（基于第 8 张垂直版）
- 投标资料封面（用第 1 张作为前页 + 第 12 张作为底页）
- 路演 PPT 模板（沿用 BASE STYLE，套用到 16:9 横版）
```



---

## 🚨 共用红线（v2）

### 中文文字防乱码 4 件套

每次 prompt 必须显式包含：

```
1. 列出所有要出现的中文（让模型对照）
2. 强调 "Strictly Simplified Chinese, no Traditional, no Japanese kanji"
3. 用 Unicode 嵌入（中文不要拆字）
4. 字号 ≥ 14pt（防止小字糊掉）

如出现乱码：
- 第一处理：告诉 AI "重新渲染中文，按下面文字精确复刻：[原文]"
- 第二处理：让 AI 留出文字位置，由设计师后期手填思源宋体
```

### 风格统一性自检清单

每张图生成后过一遍：

```
□ 配色是否仅用 v2 色板（未出现 #1e5fbf / #d4953a / 纯白）
□ 中文标题是否 Source Han Serif（非苹方 / 非微软雅黑）
□ 英文标题是否衬线体（非 Helvetica / 非 Inter）
□ 留白是否 ≥ 50%
□ 主信息块是否 ≤ 3 个
□ 是否含至少一个 logo 元素延伸（罗盘 / 螺旋 / 古钱币方孔）
□ 是否避免 SaaS infographic 感
□ 是否避免 isometric 3D / 卡通插画
□ 是否带印刷质感（embossed / film grain / paper texture）
□ 是否含金属质感（brushed metal / gold foil / metallic disc）
```



---

## 📦 完整 12 张总览

| # | 标题 | 核心功能 | 视觉重心 |
|---|---|---|---|
| 1 | 封面 Cover | 品牌入口 | logo + 大留白 |
| 2 | 序章 Foreword | 创始人致辞 | 长文 + 签名 |
| 3 | 五大经营之痛 | 行业痛点 | 大写汉字 + 列表 |
| 4 | 同乾哲学 | 易经乾卦 | 古字 "乾" 占据中心 |
| 5 | 五大杀手锏 | 5 个核心模块 | 5 列网格 |
| 6 | 三层服务漏斗 | 商业模式 | 倒金字塔 |
| 7 | 智能管家裂变网络 | 4 类智能管家 + 5 级信誉 | 网络图 + 古钱币 |
| 8 | 合伙人招募 | 招商页 | QR 码 + 大写数字 |
| 9 | 合规与安全 | 4 层隔离 + 7 大承诺 | 印章套盒 |
| 10 | 五年路线图 | 增长曲线 | 5 根金属柱 |
| 11 | AI 输出边界 | Tier 4 级方法论 | 4 行表格 |
| 12 | 联系页 Contact | 收尾 | logo + QR |

每张文件独立可印刷，组合成 12 页内页 + 1 张封面 = 14 折页线装图册。



---

**版本**：v2.0（基于 logo 重写）
**日期**：2026-05-16
**适用**：湖北省同乾咨询有限公司 · 同乾方略品牌 · 2026 年图册
**审美锚定**：故宫文创 / 苏富比 / 中国银行年报 / Pentagram brand book
