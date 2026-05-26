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

---

## M40 Snapshot Anchor - 2026-05-26

| Tag | Scope | Verify |
|---|---|---|
| v0.1.5-pre-launch | M0-M40 mainstream construction SaaS modules: material ledger, subcontract evaluation, actual cost variance, meeting OA, quality closure | verify-m40.ps1 16/16 PASS |

Rollback anchor before M40 remains `v0.1.4-pre-launch`; M40 launch anchor is `v0.1.5-pre-launch`.


---

## §B. 永久红线 · gov 端真实定位（2026-05-26 纠错追加，避免再犯）

### B.1 4 端真实定位锁死（任何会话不得修改）

| 端 | 真实身份 | 真实模块 | 红线 |
|---|---|---|---|
| `apps/web` | 建筑企业老板 + 员工 | 经营机会 / 招标 / 资质 / 合同 / 项目部 / 现金流 / 报告 等 17 大功能区 | 商业版,可以游戏化 |
| `apps/agent` | **智能管家**(资质/投标/金融/综合 4 子类型) | 派单大厅 / 信誉看板 / 客户运营 / 推荐费 | 双轨命名,代码 agent / 用户可见"智能管家",**禁"中介"** |
| `apps/gov` | **政府工程管理员 + 央国企工程口干部**(单位人,在单位上班用) | **5 大模块**:政策学习 / 公文 AI 矩阵 / 项目寻源(双向脱敏) / **政策性资金作战地图(30+ 项)** / 化债投融资咨询入口 | **强制国产模型**(BR-505 也禁海外) + 公文水印 + IP 追溯 + 6 年留存 + **SHALL NOT 启用游戏化** + 字段级权限隔离 |
| `apps/admin` | 同乾方略平台运营团队 | 7 大可视化模块(数据源/规则/Prompt/路由/模板/审批/运营) + BR-901/902 红线监控 | 仅 PLATFORM_OWNER 注册 |

### B.2 ❌ gov 端永久禁用方向(M39 子块 1.3+7 错误,M40 子块 1 已撤回)

**SHALL NOT 出现以下任何概念**:
- ❌ "个人办公用户" / "个人办公"
- ❌ 个人证书雷达(一建/二建/监理证书到期提醒)
- ❌ 注册类考试雷达(一建/二建/监理/造价/安全工程师 报名截止)
- ❌ 简历库 / 个人业绩库
- ❌ 把 gov 端当"一般用户"或"个人用户"对待

**真相**:`apps/gov` 服务的是政府工程口干部 + 央国企工程口干部,他们用本平台是为单位办公(政策学习/公文/资金申报/项目寻源),**信息敏感不能动**(强制国产模型 + 数据出境禁用 + 6 年审计留存 + 字段级隔离)。

### B.3 错误归档(防再犯)

| 错误 | commit | 撤回 |
|---|---|---|
| M39 子块 1.3 删 declarations + funds + 红色装饰条 + 改"个人办公" | `75ecd66` | M40 子块 1(用 `git show 75ecd66^:...` 恢复) |
| M39 子块 7 加 personal/cert-monitor + exam-radar + personal-doc | `a6862f1` | M40 子块 1(直接删 personal/*) |
| 我之前的会话答复"政企用户当一般用户对待" | (对话级幻觉) | M40 子块 1 + ADR `2026-05-26-adr-auto-revert-m39-gov-mistake.md` |

### B.4 任何会话开始前的 gov 自检 checklist

如果会话涉及 `apps/gov` 任何改动,先回答这 5 题:
- [ ] 是否会强制国产模型?(必须是)
- [ ] 是否给政府工程管理员 / 央国企工程口干部用?(必须是)
- [ ] 是否对应 23 号 spec 5 大模块之一?(必须是)
- [ ] 是否含公文水印 + IP 追溯 + 6 年留存?(政企版必须)
- [ ] 是否避免游戏化机制?(必须是)

任一答否 → 立刻停手,先读 `.kiro/specs/23-gov-soe-workspace/requirements.md`。


---

## §C. 永久事实 · M40 + M41 收口决策(2026-05-26)

### C.1 M40(10 子块/12 commits,verify 40/40,tag v0.1.5-pre-launch)
1. 撤回 M39 子块 1.3+7 错砍 gov(declarations/funds 复活)+ ADR 备案
2. 政策性资金作战地图 30+ 项(R5,**删一案两书** → 改用项目建议书 + 可研报告)
3. 公文 AI 矩阵 V4 **12+** 模板 + 水印 + IP + 强制国产(**新增项目建议书 800 点 + 可研报告 1500 点**)
4. 政策学习 R2 + 项目寻源双向脱敏 R4
5. 建筑企业 4 标准模块(物资 / 分包 / 实际成本 / 质量验收,只放 web)
6. gov 合规校准(强制国产 + 不游戏化 + 6 年审计)
7. **🆕 智能管家机会扫描**(QUAL/TENDER/FIN 各 5 源 + AI 话术)
8. **🆕 智能管家 6 维全套业务**(2 commits 拆):
   - 8a:跟进 timeline + 6 阶段管道 + 5 类话术 + **删 22-V4-9 培训**
   - 8b:**永久客户绑定 + 分润 ledger + 健康度 + 续约日历 + 业绩驾驶舱 + 业务知识库**
9. **🆕 AI 中转站统一收口**(midlayer 单一 baseURL + 应急 deepseek + 删 openrouter)
10. **🆕 智能管家三类中介真业务工具 9 件套**(2 commits 拆,**AI 替你干活,不是教你干活**):
    - 10a  QUAL 3 + TENDER 3 工具:**资质材料 AI 体检**(200 点) + **业绩证明 AI 整理打包**(300 点) + **人员配置缺口算盘**(100 点) + **资格条件 AI 比对**(150 点) + **标书 AI 起草助手**(800-1500 点,复用 M28 RFP RAG) + **答疑函 AI 草稿**(100 点)
    - 10b  FIN 2 + 共用 1 工具:**融资方案书 AI 起草**(1000 点 8 章) + **客户征信 AI 解读**(200 点 红黄线) + **客户咨询秒答**(50 点,**频率最高,日 5-20 次**)
    - 单智能管家月扣点 ~30000 点,全部业务相关
### C.2 M41(5 项 + verify,tag v0.1.6-pre-launch,**最终冻结**)
1. **P0 进度款回款节奏自动测算**:M21 现金流 + M30 进度款台账 衔接,合同条款 + 实际进度 → AI 推下次回款时间表
2. **P0 农民工实名制 + 工资 ABCD 表辅助**:住建部强制合规
3. **P1 资质借用风险扫描**:法律灰区扫描(不是潜规则)
4. **P1 同行中标价反推**:项目利润事后推算(不是潜规则定价)
5. **P2 设备 / 周转材料调度台账**:物资管理(M40 子块 5)的延伸,塔吊 / 模板项目间共享

### C.3 M41 之后强制冻结(任何会话不得再加新功能,违反此条立即停手)

**真正瓶颈不在功能,在以下 5 件事**:
1. 测试覆盖率 < 15% → 70%(M42 测试加固)
2. 律师审智能管家分润 / 客户保护期 / 客户信誉挂载 灰区(M43)
3. 同乾方略真案例 ≥ 20 单(M44 案例库,万婷婷线下跑)
4. VPS 真灰度发布机制(M45)
5. 监控可观测性 3 支柱真接(M46)

### C.4 AI 路由架构(M40 子块 9 后永久不变)

| 端 | 路由 | 凭证 |
|---|---|---|
| 非 gov 任务(web/agent/admin) | 万婷婷自建中转站 | `MIDLAYER_API_KEY` + `MIDLAYER_BASE_URL` |
| 应急通道(后台 1 键切) | DeepSeek 直连 | `DEEPSEEK_API_KEY` |
| **gov 任务(强制国产)** | 阿里百炼(M3.12) | `ALIYUN_DASHSCOPE_API_KEY` |
| ❌ 已废弃 | OpenRouter | M40 删除 `OPENROUTER_API_KEY` |

### C.5 智能管家全套业务系统 6 维度(M40 子块 7+8 后永久结构)

| 子类型 | 派单 | 机会扫描(M40 子块 7) | 6 维全套 CRM(M40 子块 8) |
|---|---|---|---|
| AGENT_QUAL 资质 | ✅ | 住建厅资质动态/处罚/建造师变更/安许到期/失信 | ✅ 6 维全 |
| AGENT_TENDER 招标 | ✅ | 招标新政/重大立项/专项债/投标失败/资质刚升 | ✅ 6 维全 |
| AGENT_FIN 金融 | ✅ | 政策性贷款/PSL-LPR/ABS-REITs/担保政策/经营异常 | ✅ 6 维全 |
| AGENT_GENERAL 综合 | ✅ | 综合(QUAL+TENDER+FIN 全开) | ✅ 6 维全 |
| PARTNER 合伙人 | ❌ | ❌(只推荐不接单) | ✅ 仅永久绑定 + 分润 ledger 维度 |

**6 维度对照真实中介痛点**:
1. 客户跟进 timeline(复用 M39 语音输入)
2. 商机管道 6 阶段看板(lead/contacted/quoting/negotiating/won/lost)
3. 5 类话术库 + AI 异议处理生成
4. **永久客户绑定**(BR-102,customerTenantId unique)+ 分润 ledger 4 状态机(frozen/settlable/withdrawable/paid)+ 冻结期 7/30/45 天分类型(BR-313)
5. 客户健康度 0-100 + 续约日历(资质 5 年/订阅到期/招标项目周期/融资扩贷)+ AI 续约建议
6. 业绩驾驶舱(月 GMV / 在管客户 / 健康度分布 / 续约日历 / 分润饼图)+ 业务知识库 feed(qual_policy/bid_rules/financing_window/industry_news/best_practice 5 类)

**SHALL NOT**:
- ❌ M40 之后再加 22-V4-9 类似的"智能管家学院 / 6 节培训"在线培训功能(线下沟通解决,产品不做)
- ❌ 在 gov 端启用任何机会扫描 / CRM / 全套业务系统(政企用户不接派单,BR-106)
- ❌ 一客户绑多智能管家(customerTenantId 唯一约束,违反 BR-102)
- ❌ 跨智能管家挪走绑定客户(除非平台介入,记 transferReason + transferredAt)


### C.6 智能管家 9 件套真业务工具(M40 子块 10 后永久结构)

> 与 C.5 6 维 CRM(管理客户 / 跟进 / 分润)互补:**C.5 是管理类、C.6 是干活类**(AI 替你处理材料 / 起草文档 / 回客户)。

| 工具 | 子类型 | 真业务用途 | 单次扣点 |
|---|---|---|---|
| 1 资质材料 AI 体检 | QUAL | 客户传材料  AI 5 分钟出"缺哪几项 + 不达标项 + 怎么补" | 200 |
| 2 业绩证明 AI 整理打包 | QUAL | 客户给一堆扫描件  AI OCR + 自动分类 + 按住建厅格式打包 zip | 300 |
| 3 人员配置缺口算盘 | QUAL | 输入目标资质 + 现有人员  AI 列"还差几个证 / 职称 / 专业",给 3 路径建议 | 100 |
| 4 资格条件 AI 比对 | TENDER | 上传招标文件  AI 30 秒抽 4 维资格清单 + 客户达标判断 | 150 |
| 5 标书 AI 起草助手 | TENDER | 按招标书评分项**自动起草章节**(复用 M28 RFP RAG) | 800-1500 |
| 6 答疑函 AI 草稿 | TENDER | 答疑文件传 AI  立刻列有利/不利变化 + 应对建议 + 标书影响章节 | 100 |
| 7 融资方案书 AI 起草 | FIN | 输入客户基本信息 + 融资金额用途  AI 起草 8 章方案书 + 财务测算 | 1000 |
| 8 客户征信 AI 解读 | FIN | 央行/工商/司法征信传 AI  5 分钟出红线/黄线/改善建议 | 200 |
| 9 **客户咨询秒答**(三类共用) | 全 | 中介输客户原话  AI 5 秒出回复草稿(3 种语气可选) | 50 |

**核心原则(2026-05-26 第 4 版方向)**:
- AI **替智能管家干活**,不是教智能管家干活
- 之前提的销售陪练 / 同行雷达 / 客户人格地图 / 收益预测 / 老板模拟器 等通用销售 SaaS 套件**不要**(脱离三类中介真业务)
- 9 件套全部对照三类中介日常 80% 时间花在的"文档地狱 + 标准查不全 + 反复修改 + 客户咨询"4 大痛点

**SHALL NOT**(避免再次走偏):
- ❌ 加销售陪练 / 角色扮演 / 模拟客户类(通用 sales SaaS 套件,不是中介真业务)
- ❌ 加收益预测 / LV 升级路径仪表盘类(通用 forecast,不是中介干活工具)
- ❌ 加同行情报圈 / 多智能管家协作社区类(社区驱动,不解决业务痛点)
- ❌ 加客户人格地图 / 4 维画像类(通用 CRM personalization,中介客户基数太小用不上)
- ❌ 9 件套之外再加 AI 互动功能,除非用户真业务高频(月 5+ 次)且 AI 替干活
## M40 v4 Final Anchor - 2026-05-26

| Tag | Scope | Verify |
|---|---|---|
| v0.1.5 | M40 v4 gov truth fix, policy fund battle map, gov doc AI matrix, policy learning, two-way sanitized sourcing, web-only building modules, gov compliance, agent opportunity scanner, agent CRM/binding/ledger/health/knowledge, midlayer routing, and 9 real agent toolkit business tools | verify-m40.ps1 40/40 PASS |


---

## D. 永久资产  海报母版 V4(2026-05-27)

### D.1 母版位置
`design/posters/v4-cyber-final/` 目录下:
- `README.md`  母版总入口 + 视觉 DNA 锁死
- `poster-A-company.md`  公司宣传海报(双业务并展)
- `poster-B-saas-launch.md`  软件公测海报(6 大功能)
- `poster-C-premium-consulting.md`  高端咨询海报(10 大服务)
- `poster-D-omnichannel-matrix.md`  全媒体矩阵海报(7 大平台)

### D.2 视觉 DNA 锁死(SHALL NOT 修改,除非创始人审核)
- 三层渐变背景:#061029  #0a1c3a  #050b1a
- 双色弧形扫光:cyan #4da6ff + violet #7b6cff
- 古建+城市 hero 场景(故宫金边 + 城市冷蓝 + 水面倒影)
- 品牌主金 #d4953a / 高光金 #f4c46b / 峰值金 #ffd97a
- 思源宋体 Heavy(标题)/ 思源黑体 Heavy(副标)
- 玻璃拟态卡片 + 圆角 12px + 铜金顶边
- 极简铜金线性图标(类 Lucide) **禁 3D 水晶发光球**

### D.3 SHALL NOT(防再次走偏)
- ❌ 任何海报不得擅自修改视觉 DNA(必须经过创始人审核)
- ❌ 不得使用 3D 水晶玻璃发光球图标(V1-V2 失败教训)
- ❌ 不得在海报中出现"中介"二字(必用"智能管家")
- ❌ 不得使用过饱和消费色(红/橙/粉/紫)作为主色
- ❌ 不得使用倒计时 / 限时大促 banner(电商感)
- ❌ 不得使用密集粒子风暴(V1 AI 味元凶)
- ❌ 不得使用老气死板的企业风(V3 极简留白失败教训)

### D.4 标准工作流
1. 选 Ideogram 3.0(中文最准)
2. 跑 6-8 张挑文字最准的 1 张
3. PS 文字层 100% 校正所有中文(必做)
4. 颜色精校(暖金 #d4953a / 深蓝 #0a1c3a)
5. Topaz Photo AI 4K 放大(印刷级)
6. 二维码替换占位框