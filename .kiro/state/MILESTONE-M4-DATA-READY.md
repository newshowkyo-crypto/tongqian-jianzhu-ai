# MILESTONE M4-DATA READY

日期：2026-05-21

## 状态

M4-DATA 数据采集、可视化审核、OCR 数字化、商业 API mock-real 切换已完成接口先行版本。

## 真实数据

- 自动采集 cron：6/6
- 手动 collector：4/4
- 数据策展 service：3/3
- OCR provider/service/controller：3/3
- CSV 导入 service/controller：2/2
- 商业 API provider：3/3
- few-shot/RAG：2/2
- Admin 数据中心页面：9/9
- 数据中心 SVG 资产：20/20
- 数据中心微动效：12/12
- 验收截图：12/12

## 截图路径

- `tests/e2e/screenshots/m4-data/data-center-dashboard.png`
- `tests/e2e/screenshots/m4-data/legal-regulations-list.png`
- `tests/e2e/screenshots/m4-data/policy-funds-curation.png`
- `tests/e2e/screenshots/m4-data/standard-templates-library.png`
- `tests/e2e/screenshots/m4-data/ocr-upload-progress.png`
- `tests/e2e/screenshots/m4-data/ocr-extraction-result.png`
- `tests/e2e/screenshots/m4-data/wenshu-csv-import.png`
- `tests/e2e/screenshots/m4-data/tianyancha-bulk-query.png`
- `tests/e2e/screenshots/m4-data/ai-scorer-detail.png`
- `tests/e2e/screenshots/m4-data/golden-library.png`
- `tests/e2e/screenshots/m4-data/friend-contributions.png`
- `tests/e2e/screenshots/m4-data/rag-injection.png`

## 等用户动作

- 裁判文书 CSV：建议购买 2000-2025 历史数据集，预算约 1000-2000 元。
- 天眼查/启信宝：购买后在 admin 凭证后台填 key。
- OCR：阿里云 OCR 充值后切 real；未充值时 mock provider 保持可演示。
- 朋友贡献：收到脱敏样本后，可直接进入 OCR + AI 评分 + 金标审核。

