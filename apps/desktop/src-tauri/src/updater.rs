use serde::Serialize;

#[derive(Serialize)]
pub struct UpdateStatus {
  pub enabled: bool,
  pub channel: String,
  pub endpoint: String,
}

#[tauri::command]
pub fn check_update_status() -> UpdateStatus {
  UpdateStatus {
    enabled: true,
    channel: "stable".to_string(),
    endpoint: "https://tongqian.example.com/desktop/latest.json".to_string(),
  }
}
