use tauri::{
  menu::{Menu, MenuItem},
  tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
  App, Emitter, Manager, Runtime,
};

pub fn install<R: Runtime>(app: &mut App<R>) -> tauri::Result<()> {
  let open = MenuItem::with_id(app, "open", "打开主窗口", true, None::<&str>)?;
  let settings = MenuItem::with_id(app, "settings", "检查更新", true, None::<&str>)?;
  let quit = MenuItem::with_id(app, "quit", "退出", true, None::<&str>)?;
  let menu = Menu::with_items(app, &[&open, &settings, &quit])?;

  TrayIconBuilder::new()
    .menu(&menu)
    .show_menu_on_left_click(false)
    .on_menu_event(|app, event| match event.id.as_ref() {
      "open" => show_main_window(app),
      "settings" => {
        let _ = app.emit("desktop://open-settings", ());
        show_main_window(app);
      }
      "quit" => app.exit(0),
      _ => {}
    })
    .on_tray_icon_event(|tray, event| {
      if matches!(
        event,
        TrayIconEvent::Click {
          button: MouseButton::Left,
          button_state: MouseButtonState::Up,
          ..
        }
      ) {
        show_main_window(tray.app_handle());
      }
    })
    .build(app)?;

  Ok(())
}

fn show_main_window<R: Runtime>(app: &tauri::AppHandle<R>) {
  if let Some(window) = app.get_webview_window("main") {
    let _ = window.show();
    let _ = window.set_focus();
  }
}
