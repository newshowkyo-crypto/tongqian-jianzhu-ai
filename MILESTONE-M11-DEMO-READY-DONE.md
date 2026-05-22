# M11 Demo Ready Done

## verify-m11.ps1

```text
PASS [1] 4 dev homepages return 200 and do not contain login
PASS [2] web m3 modules have seedKpis>=4 seedRows>=5 seedActions>=3
PASS [3] api-client mock defaults on unless NEXT_PUBLIC_API_MOCK=false
PASS [4] 4 dashboard fixtures contain demo KPIs and rows
PASS [5] 4 next.config.mjs files rewrite /api/v1 to localhost:4000
PASS [6] 4 layouts wire QueryClientProvider through QueryProvider
PASS [7] 4 dev apps have console.error count = 0
PASS [8] Cmd+K, notifications, theme toggle and AI orb have real handlers
PASS [9] visual-lint still PASS
PASS [10] verify-m5 through verify-m10 still PASS
PASS artifacts 6 screenshots are real and DeepSeek traceId exists
PASS 10/10
```

## Screenshots

```text
m11-admin-dashboard-with-metrics.png 7700509 bytes IDAT=1876
m11-web-ai-orb-deepseek-reply.png    9215272 bytes IDAT=2245
m11-web-cmdk-search.png              8164715 bytes IDAT=1989
m11-web-contracts-with-rows.png      8002175 bytes IDAT=1949
m11-web-dashboard-with-real-kpis.png 9356011 bytes IDAT=2279
m11-web-opportunities-with-rows.png  8038545 bytes IDAT=1958
```

## DeepSeek Trace

```json
{
  "traceId": "d938966f-d0a2-4cf4-9ab8-d957f45cec8c",
  "responseTraceId": "877c3144-0cfa-4c67-ae2f-03fc15863389",
  "provider": "deepseek_direct",
  "model": "deepseek-reasoner",
  "tier": 2,
  "confidence": "medium",
  "summary": "未提供具体合同文本，但可按常见工程合同梳理5个典型付款风险点。"
}
```

## DeepSeek Response

```text
免责声明：本输出为AI经营决策参考，不替代法律专业意见。具体合同审阅需结合原件和完整背景。

付款风险点：
1. 付款节点模糊：未明确阶段性付款的具体条件和时间，易产生争议。
2. 逾期付款责任缺失：未约定逾期付款违约金或利息，导致业主拖延。
3. 质保金返还条件不清晰：质保期起算点、返还期限未写清，可能长期占压资金。
4. 付款与验收脱钩：未将付款与分项验收或进度确认挂钩，已完工部分无法及时收款。
5. 支付方式不安全：如未约定业主将款项付至指定账户、保函替代预留金等保障措施。

行动建议：
1. 智能管家尽快获取合同原件、招标文件、来往函件。
2. 老板关注付款周期是否与项目现金流匹配，必要时补充逾期责任条款。
3. 经营层在补充风险评估后，可委托法务或顾问审核付款条件。
```

## Module Seed Detail

All `webModulePages` entries are generated from `basePages` with:
- `seedKpis`: 4 rows per module.
- `seedRows`: 5 rows per module.
- `seedActions`: 3 rows per module.

Runtime check in `verify-m11.ps1` confirmed at least 17 modules and no seed gaps.

## Console Error Audit

```json
[
  { "app": "web", "count": 0, "errors": [] },
  { "app": "admin", "count": 0, "errors": [] },
  { "app": "agent", "count": 0, "errors": [] },
  { "app": "gov", "count": 0, "errors": [] }
]
```
