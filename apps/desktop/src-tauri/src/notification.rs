use serde::Serialize;
use tauri::{AppHandle, Emitter};

#[derive(Serialize)]
pub struct DesktopNotification {
  pub title: String,
  pub body: String,
  pub route: Option<String>,
}

#[tauri::command]
pub fn show_tray_notification(app: AppHandle, title: String, body: String, route: Option<String>) -> Result<(), String> {
  app
    .emit("desktop://notification", DesktopNotification { title, body, route })
    .map_err(|error| error.to_string())
}
