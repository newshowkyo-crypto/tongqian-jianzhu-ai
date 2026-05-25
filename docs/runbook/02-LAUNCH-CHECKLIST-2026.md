# 同乾方略 · 建筑 AI 经营管家 上线清单（万婷婷专用）

> 本文件是 M0-M31 全部代码层完成后，剩余 **需要你万婷婷亲手做的全部上线工作**。
>
> 目标：3 步走完上线 — 凭证 → ICP → VPS 启动。
>
> 当前状态（2026-05-23）：代码层完整；DeepSeek 真付费 ✓；ICP 审核中尾声；VPS 已购（阿里云华东 1）；GitHub 仓库 + 双推已通。

---

## 第 1 步 · 凭证清单（admin 后台一键填）

### 1.1 操作路径

1. 浏览器打开你的 admin 后台地址（部署到 VPS 后访问 `https://admin.tongqianjianzhu.com/admin/credentials`）
2. 找到对应凭证 → 点"编辑" → 粘贴真值 + 写"变更原因" → 提交
3. 提交后系统自动 **加密入库** + **写审计日志**
4. 提交后点"测试连通"按钮 → 看到绿色 "已连通 latencyMs=XXX" → 成功
5. 测试通过后点"切到真实模式"

### 1.2 P0 必填（共 8 个，缺任一上不了线）

| # | 凭证 Key | 申请路径 | 你当前状态 | 预计申请周期 |
|---|---|---|---|---|
| 1 | `DEEPSEEK_API_KEY` | platform.deepseek.com/api_keys | **✓ 已付费** | — |
| 2 | `ALIYUN_DASHSCOPE_API_KEY`（阿里百炼）| dashscope.console.aliyun.com/apiKey | ⏳ 待申请 | 即时（5 分钟）|
| 3 | `OPENROUTER_API_KEY` | openrouter.ai/keys | ⏳ 待申请 | 即时 |
| 4 | `WECHAT_MP_APP_ID` + `WECHAT_MP_APP_SECRET`（公众号）| mp.weixin.qq.com → 设置 → 基本配置 | ⏳ 已认证待获取 | 已认证就 5 分钟 |
| 5 | `ALIYUN_OSS_ACCESS_KEY_ID` + `ALIYUN_OSS_ACCESS_KEY_SECRET` | ram.console.aliyun.com → 用户 → AK | ⏳ 待开通 | 即时（开通 OSS 服务后 5 分钟）|
| 6 | `ALIYUN_OSS_BUCKET` + `ALIYUN_OSS_REGION` | oss.console.aliyun.com 创建 Bucket | ⏳ 待开通 | 5 分钟 |
| 7 | `ALIYUN_SMS_ACCESS_KEY_ID` + `_SECRET` + `SIGN_NAME` | dysms.console.aliyun.com | ⏳ 待审签名 | 1-3 天审签名 |
| 8 | `ICP_RECORD_NO` | beian.miit.gov.cn 备案号 | ⏳ 审核最终阶段 | 几天内下证 |

### 1.3 P1 推荐填（不阻塞上线，但功能受限）

| # | 凭证 Key | 用途 | 缺失影响 |
|---|---|---|---|
| 9 | `WECHAT_PAY_MCH_ID` + `WECHAT_PAY_API_KEY` + `WECHAT_PAY_CERT_PATH` | 微信支付订阅 / 充值 | 暂用支付宝兜底 |
| 10 | `ALIPAY_APP_ID` + `ALIPAY_PRIVATE_KEY` | 支付宝订阅 / 充值 | 至少留一个支付通道 |
| 11 | `WECHAT_WORK_AGENT_ID` + `WECHAT_WORK_SECRET` | 企业微信通知 | 用阿里短信兜底 |
| 12 | `TIANYANCHA_API_KEY` | 客户尽调（M29） | 尽调功能降级为 placeholder |
| 13 | `DASHVECTOR_API_KEY` | 向量库（M27 RAG）| trigram fallback 够用 |
| 14 | `ALIYUN_OCR_ENABLED` + `ALIYUN_DOCMIND_ENABLED` | 合同 / 招标 PDF OCR（M14/M15）| 用户须传文本版 |
| 15 | `ALIYUN_SLS_PROJECT` + `_LOGSTORE` + `_ENDPOINT` | 阿里云日志服务 | 用 pino 本地日志 |

### 1.4 凭证测试连通预期结果

| Key | 测试连通输出（成功）|
|---|---|
| DEEPSEEK | `{ ok: true, latencyMs: 200-800 }` |
| OPENROUTER | `{ ok: true, latencyMs: 300-1500 }`（海外可能慢）|
| ALIYUN_DASHSCOPE | `{ ok: true, latencyMs: 100-500 }` |
| WECHAT_MP | 因 placeholder 返回 401 是预期，真值后 200 |

---

## 第 2 步 · ICP 备案（你当前在审核尾声）

### 2.1 你已经做了的

- 法人 + 域名 + 阿里云账号 ✓
- 资料已提交阿里云控制台 ✓
- 公安局核验视频 / 幕布拍照（如要求）✓

### 2.2 下证后操作（5 分钟）

1. 阿里云后台拿到 **「鄂 ICP 备 XXXXXXXX 号」** 完整字符串
2. 浏览器打开 `https://admin.tongqianjianzhu.com/admin/credentials`
3. 找 `ICP_RECORD_NO` → 编辑 → 粘贴备案号 → 提交
4. 切到"真实模式"
5. **4 端页脚自动显示备案号**（IcpFooter 组件早已就位）：
   - `apps/web` 老板端
   - `apps/agent` 智能管家端
   - `apps/gov` 政企端
   - `apps/admin` 后台

### 2.3 公安备案（备案下证后 30 天内必须做）

1. 网站正式上线 30 天内必须做"公安联网备案"
2. 路径：beian.gov.cn → 注册 → 上传材料
3. 拿到公安备案号（鄂公网安备 XX 号）后填到 admin → 同上路径
4. 4 端页脚同时显示 ICP + 公安备案号

---

## 第 3 步 · VPS 部署（你 deploy@101.132.191.128 已购）

### 3.1 一次性 bootstrap（VPS 第一次装）

```bash
# 你本机 PowerShell 跑
ssh deploy@101.132.191.128

# VPS 上跑（root / sudo 用户）
cd ~
curl -fsSL https://raw.githubusercontent.com/newshowkyo-crypto/tongqian-jianzhu-ai/main/infra/deploy/bootstrap.sh -o bootstrap.sh
chmod +x bootstrap.sh
sudo ./bootstrap.sh
```

bootstrap.sh 会自动做：
- 装 Docker + Docker Compose plugin
- 装 git / jq / ufw 防火墙（开 22/80/443）
- 拉同乾方略 GitHub 仓库到 `/opt/tongqian`
- 创建 `data/{pg,redis,backup,oss-cache,nginx-cache,uptime-kuma}` 6 个目录
- 拷贝 `.env.example` 到 `.env.prod`（待填）

### 3.2 填生产环境变量（VPS 上）

```bash
sudo nano /opt/tongqian/.env.prod
```

**必填（≤ 8 个，保存即可，凭证晚点 admin 在线改）**：

```bash
# 数据库（VPS 容器内自洽）
POSTGRES_USER=tongqian
POSTGRES_PASSWORD=$(openssl rand -hex 24)   # 复制粘贴一个 24 位随机
POSTGRES_DB=tongqian_prod

# Redis（同上）
REDIS_PASSWORD=$(openssl rand -hex 24)

# JWT（必须 ≥ 64 位）
JWT_SECRET=$(openssl rand -hex 64)

# 主加密密钥（凭证存储用）
MASTER_ENCRYPTION_KEY=$(openssl rand -hex 64)

# DeepSeek（你已有）
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxx

# ACR（如不用阿里云镜像可跳，用 GitHub Container Registry 也行）
ACR_REGISTRY=registry.cn-hangzhou.aliyuncs.com/tongqian
ACR_USERNAME=your_aliyun_username
ACR_PASSWORD=your_acr_password
```

**注意**：
- `MASTER_ENCRYPTION_KEY` **绝对不能丢**（丢了所有凭证解不开），建议**线下纸质备份**
- 其他凭证（百炼 / OSS / 短信 / 微信）**不要**填这里，留空即可，**上线后在 admin 后台一键改**

### 3.3 启动生产环境

```bash
cd /opt/tongqian

# 拉 4 端镜像（如已配 ACR）
bash infra/deploy/deploy.sh prod-latest

# 或者本机 build（VPS 算力够 8C16G 才行）
bash infra/scripts/build-images.sh prod-latest
docker compose -f infra/docker-compose.prod.yml up -d

# 等 healthy（约 60-90 秒）
docker compose -f infra/docker-compose.prod.yml ps
```

### 3.4 健康检查（6 个端点全过才算上线）

```bash
bash infra/deploy/health-check.sh
```

预期输出：

```
http://127.0.0.1:4000/health -> 200       # api
http://127.0.0.1:3000/api/health -> 200   # web 老板端
http://127.0.0.1:3010/api/health -> 200   # admin 后台
http://127.0.0.1:3011/api/health -> 200   # agent 智能管家
http://127.0.0.1:3012/api/health -> 200   # gov 政企
http://127.0.0.1/healthz -> 200            # nginx
ALL HEALTHY
```

### 3.5 配域名 + SSL（最后一步）

```bash
# 1. 域名 DNS 指向 101.132.191.128
#    a 记录：tongqianjianzhu.com / *.tongqianjianzhu.com → 101.132.191.128

# 2. 装 acme.sh 申请 Let's Encrypt 免费 SSL
sudo curl https://get.acme.sh | sh
~/.acme.sh/acme.sh --issue -d tongqianjianzhu.com -d *.tongqianjianzhu.com --dns dns_ali \
  --keylength ec-384

# 3. 证书放 nginx 路径
sudo ~/.acme.sh/acme.sh --install-cert -d tongqianjianzhu.com \
  --key-file /opt/tongqian/infra/nginx/ssl/key.pem \
  --fullchain-file /opt/tongqian/infra/nginx/ssl/cert.pem \
  --reloadcmd "docker compose -f /opt/tongqian/infra/docker-compose.prod.yml restart nginx"

# 4. 自动续签（acme.sh 默认有 cron）
crontab -l | grep acme
```

### 3.6 子域名规划（推荐）

| 域名 | 指向 | 用途 |
|---|---|---|
| `tongqianjianzhu.com` | apps/web 老板端（3000） | 主站 + 营销页 |
| `app.tongqianjianzhu.com` | apps/web 老板端 | 老板登录后入口 |
| `agent.tongqianjianzhu.com` | apps/agent（3011） | 智能管家工作台 |
| `gov.tongqianjianzhu.com` | apps/gov（3012） | 政企 / 央国企 |
| `admin.tongqianjianzhu.com` | apps/admin（3010） | 平台后台（仅你 + 客户成功 + 运维 用）|
| `api.tongqianjianzhu.com` | apps/api（4000） | API 接口 |

nginx.conf 已经按这套配好（`infra/nginx/nginx.conf`），你只需要 DNS 解析即可。

---

## 第 4 步 · 上线后 7 天必做（你的事）

### 4.1 D+0（上线当天）

- [ ] admin 登录测：`/admin/onboarding` 看 3 步全绿
- [ ] DeepSeek 实跑：随便建一个合同审查任务，看 traceId 真返回
- [ ] 充 100 元到 DeepSeek 账户做 buffer（按当前价 1M token ¥1，能跑 1000+ 次）
- [ ] 给万婷婷自己手机号注册一个老板账号 → 走完一遍完整流程

### 4.2 D+1 到 D+3（前 3 天）

- [ ] **业务底料启动**：admin → `/admin/legal-corpus` → 上传 6 个权威 PDF（GF-2017-0201 / 招投标法 / 资质标准 / GB50500-2024 / GB50300 / 法释[2020]25 号）
- [ ] 跑 M27 batch generate-all → AI 自动抽 ~1000 条规则候选（成本 ¥5-15）
- [ ] 找律师朋友审 100 条最高 confidence 的（建议先放 confidence ≥ 0.90 的进 active）
- [ ] **3 个 baseline 数据审**：admin → 系统配置 → BaselineUnitCost / QuantityIndicator / CarbonFactor 让你认识的造价师过一遍 240/240/30 行 CSV

### 4.3 D+4 到 D+7（第一周）

- [ ] 邀请 3 个智能管家试用 → 跑通"派单大厅 → 接单 → 完成 → 信誉分"完整闭环
- [ ] 邀请 1 家建筑公司试用 → 跑通"合同审查 → AI 报告 → 律师复核"完整闭环
- [ ] 接入公众号自动推送：admin → 凭证 → 微信公众号 → 测试连通 → 老板早报第一次 7:30 自动推
- [ ] 备份策略验证：手动跑 `bash infra/deploy/backup.sh`，看 OSS 上有没有 pg dump

### 4.4 D+30（一个月内必做）

- [ ] 公安联网备案
- [ ] 等保 2.0 三级测评（可选，但有助接政企单子）
- [ ] 跑灰度演练：`bash infra/deploy/canary.sh prod-v0.2.0`（虽然 canary 是分段健康守门员不是真灰度，但流程要通一遍）
- [ ] 跑灾备演练：`bash infra/deploy/restore.sh oss://your-bucket/backup/2026-MM-DD-pg.sql.gz`（验证从 0 恢复能力）

---

## 第 5 步 · 监控 + 应急（万婷婷需要知道）

### 5.1 出问题第一时间看哪里

| 现象 | 命令 | 看什么 |
|---|---|---|
| 网站打不开 | `bash infra/deploy/health-check.sh` | 6 个端点哪个 200 哪个挂 |
| API 报 500 | `docker compose -f infra/docker-compose.prod.yml logs --tail 100 api` | 最后 100 行错误日志 |
| AI 不响应 | admin → `/admin/credentials` → DeepSeek 测试连通 | 是否凭证过期 / 余额耗尽 |
| 数据库异常 | `docker exec -it tqj-prod-postgres psql -U tongqian` | 直接进 psql 排查 |
| 客户掉线 | 看 `docker compose ... logs nginx` | nginx 限流 / 502 |

### 5.2 一键回滚

```bash
# 当前版本有问题 → 切回上一版本
bash infra/deploy/rollback.sh
```

回滚后看 health-check，全 200 即恢复。

### 5.3 紧急联系顺序

1. 你（万婷婷）
2. 客户成功（接客户电话）
3. 运维客服（处理技术）
4. 阿里云工单（基础设施挂）
5. DeepSeek / OpenRouter / 阿里百炼 客服（AI 模型挂）

### 5.4 红线告警（V4 §3.8 商业宪法）

代码已埋好 6 项业务红线监控，触发即停服 + 通知：

- AI 单点成本 ≥ ¥0.07
- 客户数据跨租户访问
- 智能管家分润计算异常
- 充值 / 退款金额对不上
- 月留存率 < 88%
- 单点登录失败 ≥ 5 次

---

## 第 6 步 · 上线 30 天回顾（KPI 红线）

按 V4 商业宪法，30 天内必须达标：

| 指标 | 目标 | 监控位置 |
|---|---|---|
| 注册用户 | ≥ 200 | admin /dashboard |
| 月活率 | ≥ 70% | admin /dashboard |
| 智能管家审核通过 | ≥ 30 人 | admin /agents |
| 第一笔 ¥199 订阅 | ≥ 1 单 | admin /subscriptions |
| 第一份 AI 报告 | ≥ 50 份 | admin /reports |
| AI 毛利率 | ≥ 70% | admin /ai-monitor |
| 客户 NPS | ≥ 50 | admin /nps |
| 投诉数 | ≤ 5 | admin /incidents |

不达标 → 触发 V4 红线 → 暂停推广 + 复盘。

---

## 附录 A · 31 个 milestone 速查

| Milestone | 主题 | 验收脚本 |
|---|---|---|
| M5-M9 | 赛博 UI + 视觉 + 数据采集骨架 | — |
| M10-M13 | 登录 + Dashboard + Stitch | — |
| M14 | 合同审查闭环 | `verify-m14.ps1` |
| M15-M22 | 招标/资质/机会/报告/派单/AI 聊天/现金流/项目部 | `verify-m{15-22}.ps1` |
| M23 | 上线就绪三件套 | `verify-m23.ps1` |
| M24 | 凭证 + ICP + 业务底料引导 | `verify-m24.ps1` |
| M25 | 桌面端 + Docker + VPS 部署 | `verify-m25.ps1` |
| M26 | 全网爬虫 + AI 抽规则 | `verify-m26.ps1` |
| M27 | 权威文本 + AI 自写规则 | `verify-m27.ps1` |
| M28 | GitHub 吸收（CWICR/RFP/red flag/17 工具）| `verify-m28.ps1` |
| M29 | 轻量功能（甘特/历史造价/交底/日周月报/尽调/照片）| `verify-m29.ps1` |
| M30 | 概算 + 粗算量 + 进度款台账 + 变更签证 + 碳排放 + task 看板 | `verify-m30.ps1` |
| M31 | 全量体检修复（lint/visual/test/tenant/tool）| `verify-m31.ps1` |

任何一个 milestone 可疑 → 跑对应 verify。

## 附录 B · 关键文件索引

- 项目记忆：`.kiro/state/PROJECT-MEMORY-2026-05-23.md`
- VPS 部署 SOP：`docs/runbook/01-vps-bootstrap.md`
- 本上线清单：`docs/runbook/02-LAUNCH-CHECKLIST-2026.md`
- 商业宪法：`AGENTS.md` §3.8 V4
- UI 视觉规范：`.kiro/steering/ui-visual-spec.md`
- 律师 SOP：`docs/sop/01-rule-curation-for-lawyer.md`
- 专家 SOP：`docs/sop/02-knowledge-upload-for-expert.md`
- QA SOP：`docs/sop/03-golden-test-for-expert.md`

---

## 一句话总结

**代码层 100% 完成**。剩下 3 件你亲手做的事：

1. **凭证**：DeepSeek ✓，等阿里百炼 / OpenRouter / 微信公众号 / OSS / 短信 5 个齐 → admin 后台 1 天填完
2. **ICP**：审核最终阶段，下证后 5 分钟在 admin 填备案号
3. **VPS 启动**：bootstrap.sh + deploy.sh + health-check.sh 三条命令，1 小时跑完

之后就是运营层 — 让律师 / 造价师审 1000 条骨架规则 + 上传你认识的造价师审 3 个 CSV baseline + 邀请前 200 用户。

**全部完成 → 同乾方略正式上线**。
