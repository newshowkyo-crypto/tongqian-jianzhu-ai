# 10 报告中心 - Tasks

## 任务总数：9

- [ ] **A1** Prisma：Report / ReportRating / ReportTemplate / ReportEscalation + migration + seed（5 大杀手锏起步模板）
- [ ] **A2** 实现 `builder/h5-renderer.service.ts`（React SSR + 组件来自 [`packages/ui/report`]）
- [ ] **A3** 实现 `builder/pdf-renderer.service.ts`（@react-pdf/renderer，A4 + 中文字体嵌入）
- [ ] **A4** 实现 `builder/brand-resolver.service.ts`（标准 / 联合智能管家 / 旗舰 三种）
- [ ] **A5** 实现 `report-builder.service.ts` 主编排 + OSS 上传 + 临时签名 URL
- [ ] **A6** 实现 `template/template.service.ts`（版本化 + 后台管理）
- [ ] **A7** 实现 `rating/rating.service.ts` + `escalation/`（人工复核 + 咨询入口）
- [ ] **A8** API + 通知触发 + e2e（场景 1 合同审查闭环包含报告生成）
- [ ] **A9** PBT：4 强制要素 100% / 品牌确定性 / URL TTL

## 完成标准

- ✅ 任意 [`11-19`] 杀手锏调用 createReport 生成 H5 + PDF
- ✅ 老板版 ≤ 3 屏；详细版 A4 中文渲染正确
- ✅ 4 强制要素全部可见


---

## V4 升级新增任务（雷达图 + 水印 + 5 引导）

- [ ] **10-V4-1** ReportDifficultyRadar 模型 + radar-calculator + radar-renderer SVG
- [ ] **10-V4-2** alternative-comparator（自己执行 vs 智能管家代办）
- [ ] **10-V4-3** 政企版禁雷达图（用文字描述）+ 雷达图 SHALL NOT 故意夸大
- [ ] **10-V4-4** inline-watermark service（45° 5% 嵌入式 PDF 内层）
- [ ] **10-V4-5** trace-qrcode 末页 traceId 二维码
- [ ] **10-V4-6** tamper-detector（检测尝试去水印 → 写审计）
- [ ] **10-V4-7** GuidanceButton 5 引导按 4 角色裁剪（老板 5 / 智能管家 3 / 政企 3 / 员工 2）
- [ ] **10-V4-8** required-elements 自动校验（缺失则 throw REPORT.REQUIRED_ELEMENT_MISSING）
- [ ] **10-V4-9** PBT：任意报告生成必含 4 要素 + 5 引导


---

## V4 IMPROVEMENTS 新增任务（漏洞 4 报告反盗版）

- [ ] **10-IMP-1** 客户姓名水印（45° 5% 嵌入式 PDF 内层 + 防 OCR）
- [ ] **10-IMP-2** ¥499+ 报告末页扫码核销二维码 + 验证 API
- [ ] **10-IMP-3** ¥499+ 报告 5 设备查看限制 + 后台重新授权
- [ ] **10-IMP-4** traceId 转发追溯（异常告警）
- [ ] **10-IMP-5** PBT：水印任意修改不可能（自动校验）
