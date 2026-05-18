mod clipboard;
mod credential;
mod file_drop;
mod notification;
mod tray;
mod updater;

fn main() {
  tauri::Builder::default()
    .setup(|app| {
      tray::install(app)?;
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
      clipboard::open_clipboard_assistant,
      credential::clear_refresh_token,
      credential::device_fingerprint,
      credential::has_refresh_token,
      credential::store_refresh_token,
      file_drop::route_file_drop,
      notification::show_tray_notification,
      updater::check_update_status
    ])
    .run(tauri::generate_context!())
    .expect("failed to run Tongqian desktop shell");
}
