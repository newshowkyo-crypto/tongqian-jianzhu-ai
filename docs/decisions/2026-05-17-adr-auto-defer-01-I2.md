# ADR-AUTO-2026-05-17  推迟 01-I2 部署时长验证到 W4 后

**日期**：2026-05-17  
**决策人**：Founder（通过 Claude 代理）  
**状态**：accepted  
**类型**：ADR_AUTO（autopilot 自动决策）

## 背景

`01-infra-monorepo/tasks.md` Phase I 任务 `01-I2` 验收要求：
> 在 staging VPS 测部署时长  15 分钟（含灰度）

Codex Autopilot 跑到 01-I2 时连续 3 次失败：
- 失败现象：`Deploy Production` workflow 在 `Deploy over SSH` 阶段 10 秒内 fail
- Codex 写 BLOCKED.md 要求用户提供日志 / 私钥 / 临时 GitHub Actions log token
- 实际原因：环境前置不齐全（详见下文）

## 问题分析

01-I2 spec 设计本身存在循环依赖，**无法在 W1 阶段完成**：

1. **ACR 镜像仓库未开通**
   - `deploy-prod.yml` 依赖 `registry.cn-hangzhou.aliyuncs.com/tongqian/*`
   - 用户尚未开通阿里云 ACR（按 PREP-CHECKLIST.md 计划在 W4 开通）
   - 没有镜像  workflow 拉不到 image  部署必失败

2. **没有 staging 环境**
   - 一期商业模式定为单 VPS 部署（详见 ADR-001）
   - 当前只有 prod VPS（101.132.191.128），无独立 staging
   - 01-I2 验收文字"staging VPS"不适用

3. **业务代码未实施**
   - W1 阶段（01-infra）只完成了 monorepo 骨架 + Docker 文件 + workflow 文件
   - 02-shared-contracts / 06-auth-rbac / 07-09 商业核心都还未开始
   - 即使能部署，也是空壳应用，"15 分钟部署完成"无意义

4. **GitHub Actions 私有仓库 log API 限制**
   - Codex 通过公共 API 看到 workflow run 失败但读不到 step-level 日志
   - 用户给临时 token 反而暴露安全风险

## 决策

**推迟 01-I2 到 M-W4-AI-DONE 里程碑后执行**：

1. progress.json 中 `01-I2` 状态从 `blocked` 改为 `deferred`
2. 添加 `deferred_to_milestone: M-W4-AI-DONE` 字段
3. 添加 `next_action`：明确 ACR 开通 + staging 配好后再做
4. 从 `blocked_tasks` 数组移除（不再阻塞 progress）
5. `current_task` 推进到 `02-A1a`
6. `phase` 切到 `2-business-core`
7. `blocked_count: 0`

## 替代方案（已否决）

- ❌ A：让用户手动给 SSH 私钥 + GitHub Actions PAT 给 Codex 调试  安全风险
- ❌ B：要求 Codex 跳过 deploy 这一步  违反 "spec 先行" 原则
- ❌ C：把 01-I2 直接标 done 不验证  撒谎
- ✅ D：标 deferred 推到 W4，明确触发条件 + ADR 留档  选定

## 影响

- 不影响整体推进（02-29 spec 不依赖 01-I2 验收通过）
- W4 ACR 开通后由 Codex 自主重新跑 01-I2
- 不影响 99-FINAL 验收（FINAL DoD 包含完整 e2e 部署验证，会覆盖 01-I2 的目标）

## 后续（W4 触发条件）

当 milestone `M-W4-AI-DONE` 触发时（10-A9 完成时），Codex 必须：
1. 提示用户开通阿里云 ACR + 提供 ACR 凭证
2. 把 01-I2 状态从 deferred 改回 pending
3. 重跑 deploy-staging.yml + deploy-prod.yml 完整链路验证
4. 验收通过后改 done

## 给 Codex 的指令（高优先级）

收到本 ADR 时立即：
1. 读 .kiro/state/progress.json 确认 mode=autopilot, current_task=02-A1a, blocked_count=0
2. 直接开始 02-A1a（packages/types/src/auth/role.ts 等 5 个文件）
3. **禁止**再围绕 01-I2 询问用户 SSH 私钥 / GitHub log 权限
4. **禁止**再次把 01-I2 加到 blocked_tasks
5. 按 build-order.md 顺序推进 02  03  04 ... 直到 99-FINAL