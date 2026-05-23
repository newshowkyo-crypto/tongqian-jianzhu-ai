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
