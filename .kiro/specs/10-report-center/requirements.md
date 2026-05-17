# 10 报告中心 - Requirements

## Introduction

> 5 大杀手锏 + 现金流 / 融资 等模块的 AI 报告**统一输出层**。落地 [`design.md` §5.10 BR-322](../00-project-overview/design.md)（4 强制要素）+ [`ui-visual-spec.md` §6.3](../../steering/ui-visual-spec.md) + [`ui-ux-rules.md` §18](../../steering/ui-ux-rules.md)。

**前置依赖**：[`02`] / [`03`] / [`04`]；后续被 [`11`-`19`] 杀手锏 + [`23`] 政府版消费。

---

## Requirements

### Requirement 1：双版本输出（老板版 H5 + 详细版 PDF）

#### Acceptance Criteria

1. **老板版 H5**：≤ 3 屏滚完，3 分钟读完
   - 顶部 traffic-light 总体结论（红 / 黄 / 绿色块 + Tier 徽章右上角）
   - 中部 5 关键发现（彩色 chips）
   - 底部 3 CTA（按 nextStepHint 自动选）
   - 末尾免责声明
2. **详细版 PDF**：A4 标准
   - 封面（联合品牌 / 标准品牌）+ 目录
   - 章节正文 + 风险条款详细列表
   - 附录（参考依据 / 政策原文 / AI 调用元数据）
   - 末页免责声明 + 信心度

### Requirement 2：4 强制要素（BR-322）

#### Acceptance Criteria

每份报告强制含：
1. **disclaimer**："本报告由 AI 生成，仅作为日常参考工具使用..."（最小字号 12px + neutral-400）
2. **tier**：1 / 2 / 3 / 4 徽章右上角浮动
3. **confidence**：高 / 中 / 低 4 圆点 ●●●○ 表达
4. **nextStepHint**：底部 CTA 按钮自动渲染（use-directly / apply-human-review / apply-tongqian-consult / mandatory-human-takeover）

实现方式：所有报告 schema **必须** `.merge(RequiredElementsSchema)`，缺失编译期 fail（已在 [`04-ai-gateway`] 强制）。

### Requirement 3：联合品牌

#### Acceptance Criteria

1. 旗舰版（¥999）SHALL 在报告封面同时展示客户公司 LOGO + 同乾方略 LOGO
2. 智能管家推荐的 ¥499+ 客户 SHALL 在封面署名"由 {智能管家机构} 联合 同乾方略 AI 出品"
3. 其他档位 SHALL 仅显示同乾方略 LOGO

### Requirement 4：报告生成生命周期

```
client 请求 → AI Gateway 返回结构化数据 → ReportBuilder 渲染 H5 + PDF → 存 OSS → 通知客户
```

#### Acceptance Criteria

1. 客户请求合同审查 / 招标解读 / 资质体检 等 → 异步任务（[`04`] BullMQ）
2. AI 调用完成 → ReportBuilder 消费 typed output + tenantContext + agentContext → 输出 2 份资源（H5 url + PDF url）
3. 资源存 OSS（私有桶，临时签名 URL ≤ 1h 公网）
4. 通知客户（站内信 + 公众号 + 桌面通知）

### Requirement 5：报告评分（用户反馈）

#### Acceptance Criteria

1. 用户阅读后可评 1-5 星 + 文字反馈
2. 评分进入 [`04-ai-gateway`] 的 Prompt A/B 测试胜出依据

### Requirement 6：报告复核（人工升级）

#### Acceptance Criteria

1. Tier 2 报告底部"申请人工复核"按钮 → 创建工单（[`24-admin-console`] 审核台 + PLATFORM_QA 处理）
2. Tier 3 报告底部"申请同乾方略咨询"按钮 → 跳 `/services/premium`（[`22-agent-workspace`] premium-shelf）
3. 复核 / 咨询 → 推荐费按 BR-313 给归属智能管家

### Requirement 7：报告模板版本

#### Acceptance Criteria

1. 报告模板（封面 / 章节 / 附录布局）SHALL 后台可调 + 版本化
2. 修改模板 SHALL 影响新生成报告，不影响历史报告

### Requirement 8：边界

1. SHALL NOT 自己生成 AI 内容（仅消费 [`04`] 输出）
2. SHALL NOT 实现完整的报告库管理（仅"我的报告"列表 + OSS 存储）
3. SHALL NOT 支持 Word / Excel 导出（一期仅 H5 + PDF）

### Requirement 9：依赖

- 强依赖：[`02`] / [`03`] / [`04`]
- 弱依赖：[`24-admin-console`] 模板配置 / [`27-notification-center`]
- 后续阻塞：5 大杀手锏 + [`19`] / [`23`]


---

## V4 升级（P4 / Q5 补丁）

### Requirement 8：执行难度雷达图（V4 BR-322 V4 升级）

#### Acceptance Criteria

1. 所有"老板版"AI 报告完成后必须展示**执行难度雷达图**
2. 雷达图 4 维：
   - **专业性**（0-100%）：自己执行需要的专业知识门槛
   - **时间**（0-100%）：自己执行的预估工时（折算成 8h 工作日的占比）
   - **风险**（0-100%）：失败概率 + 影响程度
   - **成本**（0-100%）：自己执行需要的外协 / 材料 / 时间机会成本
3. 下方文案展示对比：
   ```
   "自己执行预计 18 小时 + 一次面审。
    申请智能管家可缩短至 5 工作日且承诺失败赔付。"
   ```
4. SHALL NOT 故意夸大难度诱导转人工（V4 BR-325 红线）
5. SHALL NOT 在政企版报告启用（政企版只用文字描述，不用游戏化雷达图）

### Requirement 9：报告水印 + 来源追溯（V4 P4 补丁）

#### Acceptance Criteria

1. 联合品牌报告（智能管家 + 同乾方略）必含双方 LOGO
2. 政企版报告必含"内部使用"水印（45° 倾斜，5% 透明度，详见 [`28`] R7）
3. 所有报告右下角加 traceId（可追溯生成路径）
4. PDF 末页含完整数据源声明 + 报告生成元数据（时间 / 版本 / 模型）
5. 报告水印禁用第三方"去水印"工具识别 → 嵌入式水印（PDF 内层）

### Requirement 10：报告底部强制 4 要素 + 5 引导按钮（V4 BR-322 V4 升级）

详见 [`00-project-overview` BR-322`](../00-project-overview/requirements.md)。

#### Acceptance Criteria

1. **4 强制要素**：
   - 免责声明（含数据源列表）
   - Tier 徽章（1-4，右上角浮动）
   - AI 信心度（4 圆点 ●●●○）
   - 数据源声明 + traceId

2. **5 引导按钮按角色裁剪**：
   - 老板：自己执行 / 申请智能管家协助 / 申请同乾方略 / 申请人工复核 / 申请专家咨询
   - 智能管家：按方案执行 / 推荐给同乾方略 / 平台客服
   - 政企：自己执行 / 申请同乾方略 / 专家小时咨询
   - 员工：自己执行 / 上报 OWNER

3. SHALL NOT 缺失任一要素（自动校验，缺失则报告生成失败）


---

## V4 IMPROVEMENTS · 报告反盗版（漏洞 4 修补）

### Requirement 11：建筑老板版报告反盗版机制

#### Acceptance Criteria

#### R11.1 客户姓名水印（全档位强制）

- 所有 PDF 报告右上角浅水印："{老板姓} 总 · {公司全称} 专属报告"
- 45° 倾斜，5% 透明度，每页重复
- 水印为嵌入式（PDF 内层）+ 防 OCR 去除
- 与政企版水印（"内部使用"）不冲突，可共存

#### R11.2 扫码核销（仅 ¥499+ 客户）

- 报告末页二维码 → 扫码到同乾方略平台 → 验证是否本租户客户
- 非本租户扫码 → 显示"本报告为同乾方略付费客户专属内容，欢迎注册体验"
- 用于阻止报告被无限转发

#### R11.3 查看次数限制（仅 ¥499+ 客户）

- 每份 PDF 最多 5 个不同设备查看（与生成时配置）
- 第 6 个设备访问 → 客户管理后台重新授权
- 防止报告被广泛分发

#### R11.4 转发追溯

- PDF 末页 traceId + 生成时间 + 客户 ID
- 平台后台可输入 traceId 追溯报告所有访问记录
- 检测异常访问（同 IP 多 traceId / 短期大量扫码）→ 风控告警

#### R11.5 政企版水印不变

- 政企版水印优先（"内部使用，不对外"）
- 客户姓名水印仅建筑企业版应用
