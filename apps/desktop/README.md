# @tongqian/desktop

Tauri 2 Windows 桌面端，复用 `@tongqian/web` 的 standalone 输出，为建筑企业用户提供同乾方略桌面入口。

## Windows MSI 打包

1. 在 Windows 11 或 GitHub Actions `windows-2022` runner 安装 Node 22、pnpm 9.12、Rust stable。
2. 执行 `pnpm install --frozen-lockfile`，确保工作区依赖完整。
3. 执行 `pnpm --filter @tongqian/desktop build:msi`，脚本会同步 root version、构建 web、准备 standalone，再调用 Tauri CLI 生成 `msi` 和 `nsis`。
4. 产物位于 `apps/desktop/src-tauri/target/release/bundle/`，更新清单位于 `apps/desktop/dist/latest.json`。
5. 将 `latest.json` 和安装包上传到 `https://download.tongqianjianzhu.com/desktop/` 对应版本目录。

## 签名占位

EV 证书就绪后，在 CI 或本机设置 `CERT_PATH` 与 `CERT_PASSWORD`，Tauri 会调用 `signtool.exe`。更新签名私钥使用 Tauri `signer generate` 生成后替换 updater pubkey，并把私钥写入 GitHub Secrets。

## 开发约束

- 桌面端不复制 Next standalone 内的 `node_modules`，避免 Windows pnpm 链接目录损坏。
- 生成的 `dist/` 和 `src-tauri/target/` 不提交。
- 后续桌面能力涉及本地文件、剪贴板或凭证时，必须先做权限提示和审计设计。
