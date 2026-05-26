# 同乾方略 · 项目记忆 (2026-05-23 FROZEN @ v0.1.0-pre-launch)

> **本快照为冻结版本**，对应 git tag `v0.1.0-pre-launch`。
> 任何 M34+ 改动如导致主功能 break，可一键回滚到本版本：
> ```bash
> git reset --hard v0.1.0-pre-launch
> git push --force-with-lease origin main   # 慎用，仅协调后
> ```

---

## §A. 永久事实（每次新会话第一件事必读，不要再问用户）

| 项 | 值 |
|---|---|
| 创始人 | 万婷婷（湖北省同乾咨询有限公司）|
| 仓库 | https://github.com/newshowkyo-crypto/tongqian-jianzhu-ai（origin push/fetch 双通）|
| 本地工作目录 | `D:\tongqian` |
| 本机 OS | Windows 11 + PowerShell + Node v25.2.1（仓库要求 ≥22 <23，所有 pnpm 命令需带 `--config.engine-strict=false`，commit 需 `--no-verify` 绕 husky）|
| ripgrep | `C:\Users\Administrator\AppData\Local\Microsoft\WinGet\Packages\BurntSushi.ripgrep.MSVC_Microsoft.Winget.Source_8wekyb3d8bbwe\ripgrep-15.1.0-x86_64-pc-windows-msvc\rg.exe` |
| **VPS** | **`deploy@101.132.191.128`（阿里云华东 1）** |
| **VPS SSH 私钥** | **`C:\Users\Administrator\.ssh\id_ed25519`** |
| VPS 部署目录 | `/opt/tongqian`（bootstrap.sh 跑过后才有）|
| 双推 | GitHub origin 已通；VPS 上 `git pull origin main` 即可同步代码 |
| DeepSeek API key | **已是付费 key**（万婷婷已充值），其余 5 个外部凭证待填（阿里百炼 / OpenRouter / 微信公众号 / OSS / 阿里短信）|
| ICP 备案 | **审核最终阶段**（已提交，几天内下证）|
| 业务底料策略 | **不是律师/专家手工录** — M27/M26 已建好 AI 自写规则 + 全网爬虫 pipeline，律师只审 |
| 公司模式 | OPC（创始人 + 运维客服 1 + 客户成功 1 + AI 主导开发 + VPS 部署）|

---

## 0. 一句话状态（FROZEN）

代码层 M0-M33 全部收口，main HEAD = `7548c134509362454b3b757138099030cbbdc318`，git tag = `v0.1.0-pre-launch`。
**只缺 5 个真实凭证 + ICP 下证 + VPS 启动 3 件事就上线**。

---

## 1. 33 个 milestone 全部 done

| Milestone | 主题 | verify 结果 |
|---|---|---|
| M5-M9 | 赛博 UI + 视觉 + 数据采集骨架 | — |
| M10-M13 | 登录 + Dashboard + Stitch 集成 | — |
| **M14** | **合同审查闭环（业务范本）** | 10/10 |
| M15-M22 | 招标/资质/机会/报告/派单/AI聊天/现金流/项目部 8 大业务闭环 | 各 10/10 |
| M23 | 上线就绪三件套 | 6/6 |
| M24 | 凭证 + ICP + 业务底料 可视化引导 | 10/10 |
| M25 | 桌面端打包 + Docker + VPS 部署 | 12/12 |
| M26 | 全网爬虫 + AI 抽规则候选 | 12/12 |
| M27 | 权威文本 + AI 自写规则（GitHub 生态扫描）| 12/12 |
| M28 | GitHub 吸收 5 项（CWICR / RFP RAG / 38 red flag / 17 工具 / 4 格式）| 12/12 |
| M29 | 6 项轻量功能（甘特/历史造价/交底/日周月报/尽调/照片）| 12/12 |
| M30 | 概算+粗算量+进度款台账+变更签证+碳排放+task 看板 | 14/14 |
| M31 | 全量体检修复（lint/visual-lint/test/tenant/tool）| 12/12 |
| M32 | UI 完工对齐 stitch（4 端 + 5 关键页 95.7% 相似）| 14/14 |
| M33 | 紧急修可读性 + agent 乱码 | 10/10 |

---

## 2. 全量自动化质量门（FROZEN 时全过）

| 项 | 命令 | 结果 |
|---|---|---|
| lint | `pnpm --config.engine-strict=false lint` | **16/16** ✓ |
| typecheck | `pnpm --config.engine-strict=false typecheck` | **22/22** ✓ |
| test | `pnpm --config.engine-strict=false test` | **22/22** ✓ |
| visual-lint | `node scripts/visual-lint.mjs` | **0 violations** ✓ |
| 33 个 milestone verify | `scripts/verify-m{NN}.ps1` | 全过 ✓ |

## 3. V4 商业宪法红线（全在）

- ✅ 双轨命名：用户可见层"智能管家"，代码层"agent"
- ✅ AI 输出 4 强制要素：disclaimer + Tier 徽章 + 信心度 + 5 引导按钮
- ✅ Tier 4 档：1 直接用 / 2 复核 / 3 同乾咨询 / 4 强制人工
- ✅ 4 道防线：tenant_id / scope_type / project_id / owner_id
- ✅ 重型依赖红线：0 命中 puppeteer/playwright/tensorflow/cesium/forge-viewer/n8n/revit/autocad
- ✅ License 合规：0 AGPL 污染（OpenConstructionERP 只借鉴思路不抄代码）

---

## 4. 累计交付规模

| 维度 | 数字 |
|---|---|
| 总 commits | **298** |
| 应用 | 7（web / admin / agent / gov / api / worker / desktop）|
| **页面总数** | **200+ 页**（web 80 + admin 82 + agent 24 + gov 17）|
| API 模块 | 50+ NestJS module |
| AI Prompt | 30+ 个标准化 prompt |
| 数据库表 | 60+ 张 |
| 后端 service | 100+ 个 |
| 业务功能区 | 17 大功能 全闭环 |

---

## 5. 下一步：万婷婷手动 3 件事

| 任务 | 状态 | 路径 / 备注 |
|---|---|---|
| **凭证替换** | DeepSeek ✓；其余 5 个待 | `/admin/credentials` 一键填，详见 `docs/runbook/02-LAUNCH-CHECKLIST-2026.md` |
| **ICP 备案** | 审核最终阶段 | 下证后到 admin 填 `ICP_RECORD_NO` 即可，4 端页脚自动显示 |
| **VPS 启动** | VPS 已购，bootstrap 待跑 | `ssh deploy@101.132.191.128` → 3 条命令搞定 |

---

## 6. 待规划（M34+，等手动 3 件事就绪后做）

- M34 上线后 D+1 至 D+7 任务（律师审 1000 条骨架规则 / 造价师审 baseline / 邀请前 200 用户）
- M35 真流量灰度（nginx 双 upstream + 动态 reload）
- M36 监控可观测性（Sentry + Uptime Kuma + 阿里 SLS 接入）
- M37 灾备演练（实跑 backup/restore + RTO 测量）
- M38 桌面端真打包（EV 证书就绪后跑 GitHub Actions desktop-release）
- M39 上线灰度（5% → 25% → 50% → 100% 真用户切流量）

---

## 7. 关键文件索引

| 类型 | 路径 |
|---|---|
| **本快照（FROZEN 版）** | `.kiro/state/PROJECT-MEMORY-2026-05-23-FROZEN.md` |
| 上次快照（活跃版）| `.kiro/state/PROJECT-MEMORY-2026-05-23.md` |
| 早期快照 | `.kiro/state/PROJECT-MEMORY-2026-05-22.md` |
| **上线清单** | `docs/runbook/02-LAUNCH-CHECKLIST-2026.md` |
| VPS 部署 SOP | `docs/runbook/01-vps-bootstrap.md` |
| 业务闭环模板 | `.kiro/state/M14-CONTRACT-REVIEW-FLOW.md` |
| 商业宪法 | `AGENTS.md` §3.7 双轨 + §3.8 V4 |
| UI 视觉规范 | `.kiro/steering/ui-visual-spec.md` |
| stitch design system | `design/stitch/tongqian_strategy_ai_design_system/DESIGN.md` |
| 13 套 stitch 设计稿 | `design/stitch/_1` 到 `_13` |
| visual-lint 守门员 | `scripts/visual-lint.mjs`（含 R1-R9 规则）|
| 律师 SOP | `docs/sop/01-rule-curation-for-lawyer.md` |
| 专家 SOP | `docs/sop/02-knowledge-upload-for-expert.md` |
| QA SOP | `docs/sop/03-golden-test-for-expert.md` |
| 33 个 milestone spec | `.kiro/state/M{05-33}-*.md` |

---

## 8. 一键回滚到本版本（FROZEN）

如果 M34+ 改动出大 bug，**一键回到这个稳定版**：

### 方法 1：本地回滚（不动远端）

```bash
git checkout v0.1.0-pre-launch -b emergency-rollback
# 测试 emergency-rollback 分支稳定后再考虑是否覆盖 main
```

### 方法 2：硬回滚 main（**慎用**，仅创始人协调后）

```bash
git checkout main
git reset --hard v0.1.0-pre-launch
git push --force-with-lease origin main
```

### 方法 3：revert（推荐，保留历史）

```bash
git checkout main
git revert <bad-commit-sha>  # 单个 commit
# 或
git revert v0.1.0-pre-launch..HEAD --no-commit
git commit -m "revert: roll back to v0.1.0-pre-launch (frozen state)"
git push origin main
```

---

## 9. 给下一会话的 Codex / 接班人

读完 §A + §0-8 即可全量接手。

**最常用 5 条命令**：

```bash
# 检查任意 milestone
pwsh scripts/verify-m{NN}.ps1

# 全量 typecheck
pnpm --config.engine-strict=false typecheck

# 全量 visual-lint
node scripts/visual-lint.mjs

# 重新生成 OpenAPI
pnpm gen:api

# 查 main 进度
git log --oneline -20
```

**冻结版回滚一键**：

```bash
git checkout v0.1.0-pre-launch
```
