# 05 Windows 桌面端 - Design

## 1. 架构

```
apps/desktop/
├── src-tauri/
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   ├── src/
│   │   ├── main.rs              # Tauri 入口
│   │   ├── tray.rs              # 系统托盘
│   │   ├── notification.rs      # 本地通知
│   │   ├── file_drop.rs         # 文件拖入
│   │   ├── clipboard.rs         # 剪贴板桥
│   │   ├── credential.rs        # Windows Credential Manager
│   │   └── updater.rs           # 自动更新
│   └── icons/
└── src-frontend/
    └── (复用 apps/web 的 standalone 构建)
```

## 2. Tauri 与 web 的桥接（IPC）

```ts
// apps/web 中的 hook
import { invoke } from '@tauri-apps/api/core';
import { isDesktop } from '@/lib/runtime';

if (isDesktop()) {
  invoke('store_credential', { token: refreshToken });
  invoke('show_tray_notification', { title, body });
}
```

桌面端独有功能在 web 中**优雅降级**（非桌面环境直接 noop）。

## 3. 通知通道集成

[`27-notification-center`] 推送时通过 SSE / WebSocket 通道下发到桌面端 → Tauri `notification.rs` 弹原生通知 + 点击跳转对应模块。

## 4. 设备绑定数据模型

```prisma
model UserDevice {
  id             String   @id @default(cuid())
  user_id        String
  tenant_id      String
  device_type    String   // 'desktop' / 'web' / 'mobile'
  device_name    String   // 'Windows PC - DESKTOP-XXX'
  device_finger  String   // 设备指纹
  last_login_at  DateTime
  last_ip        String
  status         String   // active / revoked
  created_at     DateTime @default(now())

  @@index([user_id, status])
  @@unique([user_id, device_finger])
}
```

## 5. 自动更新签名

使用 minisign 生成密钥对：
- public key：嵌入 `tauri.conf.json`（编译期）
- private key：保存在 GitHub Actions Secret（`TAURI_UPDATER_PRIVATE_KEY`）
- release workflow 自动签名 .msi + manifest

## 6. 测试

- 单测：Tauri command 单测（Rust）
- e2e：Playwright + Tauri webdriver
- 手测：每个 release 创始人手测一次

## 7. 错误码

`SEC.DEVICE.*`（与 [`28-security-compliance`] 共享命名空间）：
- `SEC.DEVICE.UNAUTHORIZED`：设备已被远程下线
- `SEC.DEVICE.FINGERPRINT_MISMATCH`：设备指纹变化（异常）

## 8. 后台覆盖

无（桌面端不暴露 system_configs）。

## 9. PBT

弱 PBT。Tauri command 单测 + 手测覆盖。
