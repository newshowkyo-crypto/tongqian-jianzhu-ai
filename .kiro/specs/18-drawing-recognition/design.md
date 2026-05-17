# 18 图纸智能识别 - Design

## 1. 模块结构

```
apps/api/src/modules/drawing/
├── upload/
│   ├── upload.service.ts          # ≤ 100MB
│   └── dwg-converter.service.ts   # DWG → PDF / PNG（开源 LibreDWG）
├── understand/
│   ├── understand.service.ts
│   └── prompts/understand.ts      # Qwen-VL-Max 多模态
├── error-detector/
│   └── error-detector.service.ts
├── version-diff/
│   └── version-diff.service.ts
└── quantity-estimate/
    └── quantity.service.ts
```

## 2. 数据模型

```prisma
model Drawing {
  id              String   @id @default(cuid())
  tenant_id       String
  project_id      String?
  file_url        String
  file_format     String   // dwg / pdf / png / jpg
  size_bytes      BigInt
  pages           Int?
  preview_urls    Json     // 每页 PNG
  created_at      DateTime @default(now())
}

model DrawingUnderstanding {
  id              String   @id @default(cuid())
  drawing_id      String   @unique
  drawing_type    String
  key_dimensions  Json
  main_components Json
  design_params   Json
  ai_task_id      String   @unique
}

model DrawingError {
  id              String   @id @default(cuid())
  drawing_id      String
  level           String   // red / yellow
  type            String
  description     String
  page_no         Int?
  ai_task_id      String   @unique
}

model DrawingVersionDiff {
  id              String   @id @default(cuid())
  old_drawing_id  String
  new_drawing_id  String
  changes         Json
  ai_task_id      String   @unique
}

model QuantityEstimate {
  id              String   @id @default(cuid())
  drawing_id      String
  components      Json     // [{name:'C30 混凝土', volume_low:..., volume_high:...}]
  ai_task_id      String   @unique
}
```

## 3. PromptTemplate

- `drawing.understand`：T1，模型 qwen-vl-max
- `drawing.error_detect`：T1，强制免责
- `drawing.version_diff`：T1
- `drawing.quantity_estimate`：T1，强制 ±30%

## 4. 关键 API

```yaml
POST /api/v1/drawings                    # 上传
POST /api/v1/drawings/:id/understand
POST /api/v1/drawings/:id/error-detect
POST /api/v1/drawings/version-diff       # body: {oldId, newId}
POST /api/v1/drawings/:id/quantity
```

## 5. 错误码 `DRAW.*`

- `DRAW.FILE_TOO_LARGE` (413)
- `DRAW.DWG_CONVERT_FAILED` (502)
- `DRAW.NOT_SUPPORTED_FORMAT` (415)

## 6. 后台覆盖

| key | 内容 |
|---|---|
| `drawing.max_file_mb` | 默认 100 |
| `drawing.error_detect.cost` | 默认 1500 |
