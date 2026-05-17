# @tongqian/desktop

Tauri 2 Windows 桌面壳，复用 `@tongqian/web` 的 standalone 输出，为建筑企业用户提供桌面端入口。

## 职责

- 启动本地 Tauri 窗口并加载 Web 前台。
- 复用 `apps/web` 构建产物，避免维护第二套前端。
- 为后续托盘、通知、文件拖拽、剪贴板和设备凭证能力预留桌面边界。

## 主要文件

| 文件                                 | 说明                                               |
| ------------------------------------ | -------------------------------------------------- |
| `src-tauri/tauri.conf.json`          | Tauri 应用、窗口和打包配置。                       |
| `src-tauri/src/main.rs`              | Rust 桌面入口。                                    |
| `scripts/prepare-web-standalone.mjs` | 复制 `apps/web` standalone 和静态资源到桌面 dist。 |
| `package.json`                       | 桌面端脚本，Tauri CLI 通过 `pnpm dlx` 调用。       |

## 启动

```powershell
pnpm --filter @tongqian/desktop dev
```

打包前准备 Web 产物：

```powershell
pnpm --filter @tongqian/desktop prepare:web
```

## 开发约束

- 桌面端不复制 Next standalone 内的 `node_modules`，避免 Windows pnpm 链接目录损坏。
- 生成的 `dist/` 和 `src-tauri/target/` 不提交。
- 后续桌面能力涉及本地文件、剪贴板或凭证时，必须先做权限提示和审计设计。
