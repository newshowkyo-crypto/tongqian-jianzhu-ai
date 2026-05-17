# 05 Windows 桌面端 - Requirements

## Introduction

> Tauri 2 打包的 Windows 桌面客户端业务功能层。仅复用 [`apps/web`] 建筑企业前台（按 [`design.md` §15.3 DOQ-004](../00-project-overview/design.md) 顶层倾向）。
>
> **本 spec 边界**（与 [`01-infra-monorepo` R8](../01-infra-monorepo/requirements.md) 区分）：本 spec 实现桌面端**业务功能**（系统托盘交互 / 本地通知 / 文件拖入 / 自动登录 / 设备绑定），骨架已由 01 spec 提供。

**前置依赖**：[`01-infra-monorepo`] G1-G3 完成；[`06-auth-rbac`] 完成（设备绑定需 JWT）。

---

## Glossary

| 术语 | 简要定义 |
|---|---|
| Tauri | 比 Electron 轻 5 倍的 Rust + Web 桌面框架 |
| MSI | Windows 安装包格式 |
| 设备绑定 | 桌面端首次登录后将设备 ID 与用户绑定，简化后续登录 |

---

## Requirements

### Requirement 1：复用 apps/web 的基本运行

#### Acceptance Criteria

1. THE `apps/desktop/` SHALL 在启动时加载 `apps/web` 的生产构建（standalone 输出），用户体验与浏览器一致。
2. THE 桌面端 SHALL 自动检测网络状态，离线时显示友好提示（不崩溃）。

### Requirement 2：原生增强功能

#### Acceptance Criteria

1. **系统托盘**：最小化时驻留托盘，含菜单（打开主窗口 / 设置 / 退出）。
2. **本地通知**：接收来自 [`27-notification-center`] 的桌面推送（资质到期 / 风险红灯 / 新机会推送）。
3. **文件拖入**：支持拖 PDF / Word / Excel 到主窗口 → 自动跳到对应模块（合同 → 风险审查；招标 → 标书工厂）。
4. **剪贴板桥**：Ctrl+Alt+V 唤起 AI 老板助理（粘贴文本快速问答）。
5. **多窗口**：至多 1 个主窗口 + 0/1 个 AI 助理浮窗（不实现真正多文档窗口）。

### Requirement 3：自动登录与设备绑定

> **与 [`06-auth-rbac` E2 设备管理](../06-auth-rbac/tasks.md) 的边界**：
> - 后端设备表 `UserDevice` + 设备列表 / 远程下线 API → [`06`] 实现
> - 桌面端 Tauri 侧的设备指纹采集 + Credential Manager 存 refresh token + 自动登录 → 本 spec 实现

#### Acceptance Criteria

1. **首次登录** SHALL 走 web 登录流程；登录成功后将设备指纹（Tauri API）+ refresh token 加密存储到操作系统钥匙串（Windows Credential Manager）。
2. **后续启动** SHALL 自动 refresh + 进入应用（无需输密码）。
3. **设备列表** SHALL 在 web 端"设置 → 设备管理"页可查看 + 远程下线（**API 由 [`06`] 提供**）。
4. **新设备登录** SHALL 触发短信验证（按 [`security-rules.md` §1](../../steering/security-rules.md)）。
5. 设备指纹采集逻辑 SHALL 仅依赖 Tauri 提供的稳定字段（machine GUID + OS arch），SHALL NOT 依赖浏览器指纹（避免与 web 端冲突）。

### Requirement 4：自动更新

#### Acceptance Criteria

1. THE 桌面端 SHALL 用 `tauri-updater` 检查更新；新版本自动下载 + 提示重启。
2. THE 更新签名 SHALL 用同乾方略代码签名证书（创始人提供，详见 [`owner-preparation-checklist.md`]）。

### Requirement 5：边界

1. SHALL NOT 实现完整的离线模式（仅展示离线提示）。
2. SHALL NOT 实现本地图纸 / 造价插件（OQ-004 触发后由 ADR-005 决定）。
3. SHALL NOT 复用政府 / 智能管家 / admin 前端（DOQ-004）。
4. SHALL NOT 在桌面端集成本地数据库（所有数据走云端 API）。

### Requirement 6：依赖

- 强依赖：[`01-infra-monorepo`] G1-G3、[`06-auth-rbac`] / [`27-notification-center`]
- 弱依赖：[`28-security-compliance`] 设备审计
