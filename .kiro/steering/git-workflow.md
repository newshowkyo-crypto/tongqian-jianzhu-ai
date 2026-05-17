---
inclusion: always
---

# Git 工作流（Git Workflow）

## 1. 分支策略

```
main                 # 生产分支（受保护）
  ↑
develop              # 开发主干
  ↑
feature/*            # 功能开发
fix/*                # bug 修复
chore/*              # 杂项（依赖升级、文档）
hotfix/*             # 生产紧急修复（直接 cherry-pick 到 main）
```

### 分支命名
- `feature/{module}-{description}` → `feature/credit-system-recharge`
- `fix/{module}-{issue}` → `fix/auth-jwt-expiry`
- `chore/{description}` → `chore/upgrade-prisma`
- `hotfix/{description}` → `hotfix/payment-callback-error`

## 2. Commit 规范

[Conventional Commits](https://www.conventionalcommits.org/)：

```
<type>(<scope>): <subject>

<body>

<footer>
```

### type
- `feat`：新功能
- `fix`：bug 修复
- `refactor`：重构（不改功能）
- `perf`：性能优化
- `test`：测试
- `docs`：文档
- `style`：格式（不改代码）
- `chore`：杂项
- `ci`：CI 配置

### 例子
```
feat(credit): 实现点数预扣 + 实扣机制

- 添加 PreCharge / Commit / Refund 三种状态
- 引入 Idempotency-Key 保证幂等
- 失败自动回滚

Closes #42
```

```
fix(auth): 修复 JWT refresh 过期未自动续期问题
```

## 3. PR 流程

### 3.1 PR 模板
```markdown
## 关联 spec
.kiro/specs/{module}/

## 变更摘要
- 新增 xxx
- 修改 xxx
- 删除 xxx

## 测试
- [x] 单元测试通过
- [x] 集成测试通过
- [x] 手动测试已完成

## 影响面
- 数据库 schema：是 / 否
- API 契约：是 / 否
- 前端 UI：是 / 否
- 配置 / 环境变量：是 / 否

## 部署注意
- 是否需要执行 migration
- 是否需要重启 worker
- 是否需要更新环境变量

## Checklist
- [x] 已读 AGENTS.md
- [x] 共享 types / contracts 已更新
- [x] 文档已更新
- [x] tasks.md 已勾选
- [x] ADR 已写（如有重大决策）
```

### 3.2 Code Review 标准
- 至少 1 人审过（OPC 模式下创始人审）
- 通过 CI（lint / typecheck / test）
- 没有 conflict
- 没有 lockfile 不一致

## 4. CI/CD 流程

```
push to feature/* → CI run
  ├── lint
  ├── typecheck
  ├── test
  ├── build
  └── e2e (关键路径)

merge to develop → CI + auto deploy 到 staging

merge to main → CI + auto deploy 到 production
```

## 5. 部署

### 5.1 Staging
- 自动部署（develop 分支）
- 内测客户使用

### 5.2 Production
- main 分支合并即触发
- VPS 拉镜像 + docker-compose up -d
- 健康检查 30s 没起来自动回滚

## 6. 回滚

```bash
# 紧急回滚（生产）
git revert <commit>
git push main

# 或回滚到上一版本
docker-compose -f docker-compose.prod.yml up -d --no-deps api:previous
```

## 7. 禁止行为

❌ 直接 push main / develop（必须通过 PR）
❌ commit 包含 .env 等敏感文件（用 .gitignore）
❌ commit message 用中文（用英文 + 中文 subject 可）
❌ 一个 commit 改超过 500 行（拆分）
❌ 一个 PR 改超过 30 个文件（拆分）
❌ rebase 已 push 的分支（除非 force-push 自己的 feature 分支）
❌ 删除 git 历史（追溯需要）
❌ 不写 commit message body（重要变更必须写）
