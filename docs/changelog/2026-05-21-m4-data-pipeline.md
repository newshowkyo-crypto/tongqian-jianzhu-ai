# M4-DATA 数据采集管道

日期：2026-05-21

## 已完成

- Worker 数据采集：新增 6 个自动 cron。
  - `legal-regulation-scraper`
  - `tender-announcement-scraper`
  - `policy-fund-scraper`
  - `industry-news-scraper`
  - `doc-template-scraper`
  - `mohurd-standards-scraper`
- Worker 手动 collector：新增 4 个 admin 可触发采集器。
  - `wenshu-csv-importer`
  - `tianyancha-bulk-import`
  - `ocr-paper-import`
  - `friend-circle-collector`
- API 数据策展：新增 AI 评分、同类质量对比、重复检测。
- CSV 导入：新增裁判文书/机会/政策资金/公司画像通用 CSV 导入入口。
- OCR 链路：新增阿里云 OCR mock-real provider、纸质资料结构化抽取、批量上传控制器。
- 商业 API：新增裁判文书、天眼查、启信宝 provider，PLACEHOLDER 下走 mock。
- Prompt/RAG：新增 few-shot 自动注入服务与金标库 RAG indexer mock。
- Admin 数据中心：新增 9 个页面。
  - `/admin/data-center/dashboard`
  - `/admin/data-center/legal-regulations`
  - `/admin/data-center/policy-funds`
  - `/admin/data-center/legal-cases`
  - `/admin/data-center/business-profiles`
  - `/admin/data-center/standard-templates`
  - `/admin/data-center/doc-templates`
  - `/admin/data-center/ocr-imports`
  - `/admin/data-center/friend-contributions`
- UI 资产：新增/更新 20 个数据中心相关 SVG 资产。
- 微动效：新增 `data-center-animations.css`，包含 12 类数据中心专用动效。

## 截图

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

## 验证

- `pnpm --filter @tongqian/worker typecheck`
- `pnpm --filter @tongqian/worker lint`
- `pnpm --filter @tongqian/api typecheck`
- `pnpm --filter @tongqian/api lint`
- `pnpm --filter @tongqian/admin typecheck`
- `pnpm --filter @tongqian/admin lint`
- `pnpm --filter @tongqian/ui typecheck`
- `pnpm --filter @tongqian/ui lint`
- `pnpm --filter @tongqian/admin build`

## 等待用户

- 购买裁判文书 CSV 历史数据集后，可走 `/api/v1/admin/csv/import?type=wenshu` 导入。
- 购买天眼查/启信宝套餐后，可在 admin 凭证后台替换 API key。
- 阿里云 OCR 未充值时保持 mock provider，充值后按环境/后台凭证切 real。
- 朋友贡献样本为 0 时不阻塞，后续上传即可进入 OCR + AI 评分审核。

