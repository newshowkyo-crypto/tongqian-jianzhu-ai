# `.env` 填写表（按重要性排序）

> 把以下内容**复制为模板**到项目根目录 `.env` 文件，逐项填值。带 ⭐ 是 Autopilot 第一阶段必填，其他可后填。

---

## 操作步骤

```bash
# 在项目根目录
cp .env.example .env
notepad .env   # 或用 VS Code 打开
```

按下方表格逐项填写。

---

## 一、应用基础（无需填，用默认）

```env
NODE_ENV=development
APP_NAME=tongqian-jianzhu-ai
APP_PORT=3000
API_PORT=4000
WORKER_PORT=4100
ADMIN_PORT=3001
AGENT_PORT=3002
GOV_PORT=3003
TZ=Asia/Shanghai
```

## 二、数据库 ⭐（必填，本地 docker 自动起）

```env
# 本地开发：docker-compose 起 PostgreSQL，默认这个就行
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tongqian_dev?schema=public"
DATABASE_POOL_MAX=20

# 本地开发：Redis 一样
REDIS_URL="redis://localhost:6379"
REDIS_PREFIX=tqj_dev:
```

## 三、阿里云 ⭐（必填）

### 3.1 阿里云主 AccessKey

来源：[阿里云 RAM 控制台](https://ram.console.aliyun.com/) → AccessKey 管理 → 创建子账号 → 授权 OSS / DashScope / OCR / SMS 完全访问 → 拿 AK 对

```env
ALIYUN_ACCESS_KEY_ID=LTAIxxxxxxxxx          # ⭐ 填
ALIYUN_ACCESS_KEY_SECRET=xxxxxxxxxxxxxxxx   # ⭐ 填
```

### 3.2 OSS

来源：OSS 控制台 → Bucket 列表

```env
OSS_REGION=oss-cn-hangzhou         # ⭐ 选你 bucket 实际所在区域
OSS_BUCKET=tongqian-files          # ⭐ 你创建的 bucket 名
OSS_ENDPOINT=https://oss-cn-hangzhou.aliyuncs.com   # ⭐ 同上区域
```

### 3.3 OCR / 文档智能

```env
OCR_ENDPOINT=https://ocr-api.cn-hangzhou.aliyuncs.com           # 默认即可
DOC_INTELLIGENCE_ENDPOINT=https://docmind-api.cn-hangzhou.aliyuncs.com
```

### 3.4 阿里百炼（Qwen 主模型）⭐

来源：[百炼控制台](https://bailian.console.aliyun.com/) → API-KEY 管理

```env
DASHSCOPE_API_KEY=sk-xxxxxxxxxxx                # ⭐ 填
DASHSCOPE_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
```

### 3.5 DashVector（可选 / 一期可用 Qdrant 兜底）

来源：DashVector 控制台 → Cluster → Endpoint + API key

```env
DASHVECTOR_ENDPOINT=https://vrs-cn-xxx.dashvector.cn-hangzhou.aliyuncs.com
DASHVECTOR_API_KEY=sk-xxx
DASHVECTOR_COLLECTION=tongqian_main
```

> 不填则 Codex 会用本地 Qdrant Docker 兜底（部署较简单）

### 3.6 短信 ⭐

来源：阿里云短信控制台 → 签名管理 + 模板管理 + AccessKey

```env
SMS_ACCESS_KEY=LTAIxxx              # ⭐ 同 ALIYUN_ACCESS_KEY 或单独子账号
SMS_SECRET=xxxxxxxx                 # ⭐
SMS_SIGN_NAME=同乾方略              # 你申请通过的签名
SMS_TEMPLATE_OTP=SMS_xxxxxxxx       # ⭐ 验证码模板 ID
```

## 四、火山方舟（备用，不强制）

来源：[火山引擎方舟](https://www.volcengine.com/docs/82379)

```env
VOLC_ARK_API_KEY=                   # 不填则跳过该 provider
VOLC_ARK_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
```

## 五、海外模型 ⭐ — 用 OpenRouter

来源：[OpenRouter](https://openrouter.ai/keys)

```env
OPENROUTER_API_KEY=sk-or-v1-xxx     # ⭐ 必填
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

BAI_API_KEY=                         # 可留空（B.AI 备用）
BAI_BASE_URL=https://api.b.ai/v1

# 二期 HK 公司注册后再填，留空
# ANTHROPIC_API_KEY=
# OPENAI_API_KEY=
```

## 六、微信生态 ⭐（公众号 + 微信支付 + 企微）

### 6.1 微信公众号

来源：[微信公众平台](https://mp.weixin.qq.com/) → 设置 → 开发 → 基本配置

```env
WECHAT_APPID=wx2xxxxxxxx              # ⭐ 公众号 AppID
WECHAT_APPSECRET=xxxxxxxxxxxxxxx       # ⭐ AppSecret
WECHAT_TOKEN=随机字符串32位            # ⭐ 自定义，与服务器配置一致
WECHAT_AESKEY=随机43位                 # ⭐ 自动生成
```

### 6.2 微信支付 ⭐

来源：[微信支付商户平台](https://pay.weixin.qq.com/) → 账户中心 → API 安全

```env
WECHAT_PAY_MCHID=160xxxxxx            # ⭐ 商户号
WECHAT_PAY_API_KEY=32位随机字符        # ⭐ APIv2 密钥（已废弃但仍需）
WECHAT_PAY_API_V3_KEY=32位随机字符      # ⭐ APIv3 密钥
WECHAT_PAY_CERT_PATH=./secrets/apiclient_cert.p12      # 把下载的证书放此处
WECHAT_PAY_KEY_PATH=./secrets/apiclient_key.pem
WECHAT_PAY_NOTIFY_URL=https://api.tongqian.com/api/v1/payments/wechat/notify
```

把下载的证书 `apiclient_cert.p12` 和 `apiclient_key.pem` 放到 `项目根/secrets/` 目录（已在 .gitignore，不会提交）。

### 6.3 企业微信 ⭐

来源：[企业微信管理后台](https://work.weixin.qq.com/) → 应用管理 → 自建应用

```env
WECOM_CORP_ID=wwxxxxxxxxxxxxxxx       # ⭐ 企业 ID
WECOM_AGENT_ID=1000002                 # ⭐ 应用 ID
WECOM_AGENT_SECRET=xxxxxxxxxxxxxxxxxx  # ⭐ Secret
```

## 七、支付宝（P1，可后填）

来源：[支付宝开放平台](https://open.alipay.com/)

```env
ALIPAY_APPID=
ALIPAY_PRIVATE_KEY=
ALIPAY_PUBLIC_KEY=
ALIPAY_NOTIFY_URL=https://api.tongqian.com/api/v1/payments/alipay/notify
```

## 八、安全密钥 ⭐（命令行生成）

```bash
# 生成 3 个 secret
openssl rand -hex 64    # → JWT_SECRET
openssl rand -hex 32    # → ENCRYPTION_KEY
openssl rand -hex 32    # → CSRF_SECRET
```

```env
JWT_SECRET=粘贴 64 字节十六进制       # ⭐ 必填
JWT_ACCESS_EXPIRES=30m
JWT_REFRESH_EXPIRES=30d
ENCRYPTION_KEY=粘贴 32 字节十六进制    # ⭐ 必填
CSRF_SECRET=粘贴 32 字节十六进制        # ⭐ 必填
```

## 九、其他默认值（无需改）

```env
LOG_LEVEL=debug
LOG_FORMAT=pretty

SENTRY_DSN=                              # P2 可后填
OPENTELEMETRY_ENDPOINT=

RATE_LIMIT_GLOBAL_PER_SEC=10
RATE_LIMIT_AUTH_PER_MIN=5
RATE_LIMIT_AI_PER_MIN=30

MAX_UPLOAD_SIZE_MB=50
ALLOWED_FILE_TYPES=pdf,doc,docx,xls,xlsx,jpg,jpeg,png,bmp,tiff

CUSTOMER_PROTECTION_DAYS=7
AGENT_FIRST_YEAR_RATE=0.30
AGENT_NEXT_YEAR_RATE=0.20
AGENT_RECHARGE_RATE=0.15
AGENT_REFER_AGENT_RATE=0.10
CROSS_DISPATCH_RATE=0.05
WITHDRAW_MIN_AMOUNT=100

COST_CLAUDE_SONNET_INPUT=3.9
COST_CLAUDE_SONNET_OUTPUT=19.5
COST_GPT5_INPUT=2.6
COST_GPT5_OUTPUT=13
COST_QWEN_MAX_INPUT=20
COST_QWEN_MAX_OUTPUT=60
COST_DEEPSEEK_V3_INPUT=2
COST_DEEPSEEK_V3_OUTPUT=8

PUBLIC_WEB_URL=http://localhost:3000
PUBLIC_API_URL=http://localhost:4000
PUBLIC_ADMIN_URL=http://localhost:3001
PUBLIC_AGENT_URL=http://localhost:3002
PUBLIC_GOV_URL=http://localhost:3003
```

---

## ⭐ 最小可启动集（11 项必填）

如果你想**今天就启动 Autopilot 跑前期 spec**，只需填这 11 项：

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/tongqian_dev?schema=public  # 默认即可
REDIS_URL=redis://localhost:6379                                                       # 默认即可
ALIYUN_ACCESS_KEY_ID=...        # 阿里云子账号
ALIYUN_ACCESS_KEY_SECRET=...
OSS_BUCKET=tongqian-files
DASHSCOPE_API_KEY=sk-...        # 阿里百炼
OPENROUTER_API_KEY=sk-or-...    # OpenRouter
SMS_ACCESS_KEY=...              # 阿里短信（OTP）
SMS_SECRET=...
SMS_TEMPLATE_OTP=SMS_...
JWT_SECRET=（openssl rand -hex 64）
ENCRYPTION_KEY=（openssl rand -hex 32）
CSRF_SECRET=（openssl rand -hex 32）
```

剩余的微信支付 / 公众号 / 企微 / 支付宝可在 Codex 跑到 09-payment-gateway / 27-notification-center 时补填，否则相关 task 自动 BLOCKED 跳过。

---

## 🔒 安全提醒

- `.env` 已在 `.gitignore` 中，**绝不提交**
- 所有 secret 仅本机用，**不分享**
- 生产环境用 VPS 上独立 `.env.prod`（不与开发共用）
- 微信支付证书放 `secrets/` 目录（gitignore）
