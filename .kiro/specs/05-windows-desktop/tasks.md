# 05 Windows 桌面端 - Tasks

## 任务总数：8

- [x] **A1** 完成 `apps/desktop/` 加载 `apps/web` standalone 构建（接续 01 G1-G3）+ 网络状态检测
- [x] **A2** 实现 `src-tauri/src/tray.rs` 系统托盘 + 菜单
- [x] **A3** 实现 `src-tauri/src/notification.rs` 本地通知 + 与 [`27-notification-center`] 通道对接
- [x] **A4** 实现 `src-tauri/src/file_drop.rs` 文件拖入路由
- [x] **A5** 实现 `src-tauri/src/clipboard.rs` 剪贴板桥（Ctrl+Alt+V 唤起）+ AI 助理浮窗
- [x] **A6** 实现 `src-tauri/src/credential.rs` 设备指纹 + Windows Credential Manager 存 refresh token
- [x] **A7** 在 `apps/api/src/modules/user/devices/` 实现设备绑定 API + UserDevice 表 + 远程下线接口
- [x] **A8** 完整化 `desktop-release.yml`（minisign 签名 + .msi 发布 + tauri-updater 配置）

## 完成标准

- ✅ 安装 .msi → 登录 → 重启自动登录
- ✅ 系统托盘 + 通知 + 文件拖入正常
- ✅ web 端"设备管理"可远程下线
