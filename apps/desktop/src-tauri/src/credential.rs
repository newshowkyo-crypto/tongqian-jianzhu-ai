use serde::Serialize;
use sha2::{Digest, Sha256};
use std::{env, process::Command};

const CREDENTIAL_TARGET: &str = "TongqianDesktopRefreshToken";

#[derive(Serialize)]
pub struct DeviceFingerprint {
  pub device_name: String,
  pub device_finger: String,
  pub os_arch: String,
}

#[tauri::command]
pub fn device_fingerprint() -> DeviceFingerprint {
  let device_name = env::var("COMPUTERNAME").unwrap_or_else(|_| "windows-desktop".to_string());
  let os_arch = env::consts::ARCH.to_string();
  let stable_seed = format!("{}:{}:{}", device_name, os_arch, env::consts::OS);
  let digest = Sha256::digest(stable_seed.as_bytes());

  DeviceFingerprint {
    device_name,
    device_finger: hex::encode(digest),
    os_arch,
  }
}

#[tauri::command]
pub fn store_refresh_token(token: String) -> Result<(), String> {
  if token.trim().is_empty() {
    return Err("refresh token is empty".to_string());
  }

  let status = Command::new("cmdkey")
    .args(["/generic", CREDENTIAL_TARGET, "/user", "refresh-token", "/pass", token.as_str()])
    .status()
    .map_err(|error| error.to_string())?;

  status.success().then_some(()).ok_or_else(|| "Windows Credential Manager rejected the token".to_string())
}

#[tauri::command]
pub fn clear_refresh_token() -> Result<(), String> {
  let status = Command::new("cmdkey")
    .args(["/delete", CREDENTIAL_TARGET])
    .status()
    .map_err(|error| error.to_string())?;

  status.success().then_some(()).ok_or_else(|| "Windows Credential Manager delete failed".to_string())
}

#[tauri::command]
pub fn has_refresh_token() -> bool {
  Command::new("cmdkey")
    .arg("/list")
    .output()
    .ok()
    .and_then(|output| String::from_utf8(output.stdout).ok())
    .is_some_and(|stdout| stdout.contains(CREDENTIAL_TARGET))
}
