use serde::Serialize;
use std::path::Path;

#[derive(Serialize)]
pub struct FileDropRoute {
  pub module: String,
  pub path: String,
  pub reason: String,
}

#[tauri::command]
pub fn route_file_drop(path: String) -> FileDropRoute {
  let lower = path.to_lowercase();
  let extension = Path::new(&path).extension().and_then(|value| value.to_str()).unwrap_or_default();

  if lower.contains("tender") || lower.contains("bid") || lower.contains("招标") {
    return route(path, "tender-factory", "tender keyword detected");
  }

  match extension {
    "doc" | "docx" | "pdf" => route(path, "risk-review", "document routed to risk review"),
    "xls" | "xlsx" | "csv" => route(path, "cost-estimate", "spreadsheet routed to cost estimate"),
    _ => route(path, "workspace", "generic workspace upload"),
  }
}

fn route(path: String, module: &str, reason: &str) -> FileDropRoute {
  FileDropRoute {
    module: module.to_string(),
    path,
    reason: reason.to_string(),
  }
}
