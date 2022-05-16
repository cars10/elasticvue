use serde::Serialize;
use std::io::prelude::*;
use std::path::PathBuf;

#[tauri::command]
pub async fn save_file(path: String, file_name: String, data: String) -> SaveResult {
    let mut save_path = PathBuf::new();
    save_path.push(path_clean::clean(&path));
    save_path.push(path_clean::clean(&file_name));

    if save_path.exists() {
        return SaveResult::AlreadyExists;
    };

    let mut file = std::fs::File::create(&save_path).unwrap();
    file.write_all(data.as_bytes()).unwrap();

    if save_path.exists() {
        SaveResult::Success
    } else {
        SaveResult::Error
    }
}

#[derive(Debug, Serialize)]
pub enum SaveResult {
    Success,
    Error,
    AlreadyExists,
}
