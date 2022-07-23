use std::fs::read_to_string;
use std::path::PathBuf;

#[tauri::command]
pub async fn load_file(path: String) -> Option<String> {
    let mut load_path = PathBuf::new();
    load_path.push(path_clean::clean(&path));

    if !load_path.exists() || !load_path.is_file() {
        return None;
    };

    read_to_string(&load_path).ok()
}
