use tauri::{AppHandle, Manager, WebviewUrl, WebviewWindowBuilder};

#[tauri::command]
pub fn open_clipboard_assistant(app: AppHandle, selected_text: Option<String>) -> Result<(), String> {
  let label = "clipboard-assistant";
  if let Some(window) = app.get_webview_window(label) {
    let _ = window.emit("desktop://clipboard-text", selected_text.unwrap_or_default());
    let _ = window.show();
    let _ = window.set_focus();
    return Ok(());
  }

  let window = WebviewWindowBuilder::new(&app, label, WebviewUrl::App("/assistant/clipboard".into()))
    .title("Tongqian Assistant")
    .inner_size(520.0, 680.0)
    .resizable(true)
    .always_on_top(true)
    .build()
    .map_err(|error| error.to_string())?;

  let _ = window.emit("desktop://clipboard-text", selected_text.unwrap_or_default());
  Ok(())
}
