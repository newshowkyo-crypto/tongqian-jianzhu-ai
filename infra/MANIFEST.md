# M25 镜像清单

| 镜像 | Dockerfile | 端口 | 体积红线 | 依赖 |
| --- | --- | --- | --- | --- |
| api | infra/docker/Dockerfile.api | 4000 | <= 250MB | postgres, redis |
| worker | infra/docker/Dockerfile.worker | 4100 | <= 250MB | postgres, redis |
| web | infra/docker/Dockerfile.next | 3000 | <= 400MB | api |
| admin | infra/docker/Dockerfile.next | 3000 | <= 400MB | api |
| agent | infra/docker/Dockerfile.next | 3000 | <= 400MB | api |
| gov | infra/docker/Dockerfile.next | 3000 | <= 400MB | api |
| nginx | infra/docker/Dockerfile.nginx | 80 | <= 80MB | web, admin, agent, gov, api |

所有业务镜像统一推送到 `${ACR_REGISTRY:-registry.cn-hangzhou.aliyuncs.com/tongqian}`，默认 tag 为 `prod-latest`。实际 build 和 push 由 CI 或有 Docker daemon 的发布机执行，本地 Codex 只做脚本语法与 compose 配置校验。

## Compose 文件分工（重要）

| 文件 | 用途 | 单独运行？ |
| --- | --- | --- |
| `infra/docker-compose.yml` | 本地开发基础栈（postgres/redis/minio/mailhog 等） | ✅ 可单独 |
| `infra/docker-compose.f.yml` | **override**：仅把数据卷指到本地 F 盘（`F:/Docker/tongqian/data/*`） | ❌ **禁止单独运行** |
| `infra/docker-compose.prod.yml` | 生产部署（配合 `.env.prod`） | ✅（生产机） |

`docker-compose.f.yml` 只含卷覆盖、不含完整服务定义，**必须与基础文件叠加使用**：

```bash
# ✅ 正确（F 盘数据目录方案）
docker compose -f infra/docker-compose.yml -f infra/docker-compose.f.yml up -d
docker compose -f infra/docker-compose.yml -f infra/docker-compose.f.yml config --quiet   # 校验

# ❌ 错误（单独跑 override，缺服务定义/镜像）
docker compose -f infra/docker-compose.f.yml up -d
```

> `infra/.env` 必须为无 BOM 的 UTF-8（否则 `docker compose` 报 `unexpected character "﻿"`）。本轮已修复其 BOM。

## 生产部署一键流程（`infra/deploy/deploy.sh`）

1. `ensure-env.sh` 校验 `.env.prod`
2. 备份现有 DB（`backup.sh`，仅当 postgres 在跑）
3. `compose pull`
4. `compose up -d postgres redis`
5. `compose run --rm migrate prisma migrate deploy`（**正式迁移，非 db push**；`db push --accept-data-loss` 仅在 `SCHEMA_SYNC=1` 显式开启且有告警）
6. `compose up -d`（api/worker/web/admin/agent/gov/nginx）
7. 健康检查（`health-check.sh`，超时回滚用 `rollback.sh` 切 `prod-previous`）

镜像构建：`infra/scripts/build-images.sh`（串行 api → worker → migrate → web/admin/agent/gov → nginx）。
