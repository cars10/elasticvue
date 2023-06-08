use std::fs::File;
use std::io::prelude::*;
use std::path::PathBuf;

#[tauri::command]
pub async fn save_file(path: String, data: String) -> Option<usize> {
    let mut save_path = PathBuf::new();
    save_path.push(path_clean::clean(&path));

    let mut file = File::create(&save_path).ok()?;
    let written = file.write(data.as_bytes()).ok()?;

    if save_path.exists() {
        Some(written)
    } else {
        None
    }
}
