# GitHub Actions Secrets

在 GitHub repo `Settings -> Secrets and variables -> Actions` 添加：

| Secret | 用途 |
| --- | --- |
| `ACR_REGISTRY` | 阿里云 ACR registry，例如 `registry.cn-hangzhou.aliyuncs.com/tongqian` |
| `ACR_USERNAME` | ACR 推送账号 |
| `ACR_PASSWORD` | ACR 推送密码或访问令牌 |
| `TAURI_SIGNING_PRIVATE_KEY` | Tauri updater 签名私钥 |
| `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` | Tauri updater 签名私钥密码 |

不要把上述值写入 workflow、Dockerfile、脚本或日志。
